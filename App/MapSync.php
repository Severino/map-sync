<?php

namespace App\Plugins\MapSync\App;

use App\Attribute;
use App\AttributeValue;
use App\EntityType;
use App\Plugins\Map\App\Geodata;

use DB;



class MapSync {
    /**
     * Removes all geodata from elements of the entity type where a geometry still exists
     * but the Geometry field is empty.
     * 
     * @param EntityType $entityType
     * @param Attribute $attribute
     * @return void
     */
    public static function removeOrphanedGeodata(EntityType $entityType, Attribute $attribute) {

        $entityTypeId = $entityType->id;
        $attributeId = $attribute->id;

        $entitiesToClear = DB::table('entities')
            ->select('entities.id', 'entities.geodata_id')
            ->where('entity_type_id', $entityTypeId)
            ->whereNotNull('geodata_id')
            ->whereNotExists(function ($query) use ($attributeId) {
                $query->from('attribute_values')
                    ->whereColumn('attribute_values.entity_id', 'entities.id')
                    ->where('attribute_values.attribute_id', $attributeId);
            })
            ->get();

        if ($entitiesToClear->isNotEmpty()) {
            $entityIds = $entitiesToClear->pluck('id')->all();
            $geodataIds = $entitiesToClear->pluck('geodata_id')->filter()->unique()->all();

            // Null out the entities' geodata_id in one query
            DB::table('entities')
                ->whereIn('id', $entityIds)
                ->update(['geodata_id' => null]);

            // Delete Geodata records that are not referenced anymore
            if (!empty($geodataIds)) {
                // Find which of these geodata ids are still referenced by any entity
                $stillReferenced = DB::table('entities')
                    ->whereIn('geodata_id', $geodataIds)
                    ->pluck('geodata_id')
                    ->all();

                $toDelete = array_diff($geodataIds, $stillReferenced);
                if (!empty($toDelete)) {
                    Geodata::whereIn('id', $toDelete)->delete();
                }
            }
        }
    }

    /**
     * Updates the geodata_id references of entities in bulk based on the provided map of entity_id to geodata_id.
     * 
     * @param array $entityGeodataMap
     * @return void
     */
    private static function updateEntityGeodataReferences(array $entityGeodataMap) {
        if (!empty($entityGeodataMap)) {
            $ids = array_keys($entityGeodataMap);
            $cases = [];
            foreach ($entityGeodataMap as $entityId => $geodataId) {
                $cases[] = "WHEN {$entityId} THEN {$geodataId}";
            }
            $caseSql = "CASE id " . implode(' ', $cases) . " END";

            DB::table('entities')
                ->whereIn('id', $ids)
                ->update(['geodata_id' => DB::raw($caseSql)]);
        }
    }

    /**
     * Creates or updates the geometry of an entity type according to a specific attribute. 
     * 
     * @param EntityType $entityType
     * @param Attribute $attribute
     * @return void
     */
    public static function createOrUpdateGeometries(EntityType $entityType, Attribute $attribute) {

        $user = auth()->user();
        $entityTypeId = $entityType->id;
        $attributeId = $attribute->id;
        $color = $entityType->color ?? '#000000';

        AttributeValue::select('id', 'attribute_id', 'entity_id',
            DB::raw('ST_AsText(geography_val) AS geography_wkt')
        )
            ->with(['entity' => function ($q) {
                $q->select('id', 'entity_type_id', 'name', 'geodata_id') // include PK
                    ->with(['geodata']);
            }])
            ->where('attribute_id', $attributeId)
            ->whereHas('entity', function ($query) use ($entityTypeId) {
                $query->where('entity_type_id', $entityTypeId);
            })
            ->chunk(100, function ($attributeValues) use ($color, $user) {
                // Map of entity_id => geodata_id to update in bulk after processing chunk
                $entityGeodataMap = [];
                foreach ($attributeValues as $attributeValue) {
                    if (empty($attributeValue->geography_wkt)) {
                        continue;
                    }

                    // Create or update Geodata record
                    $geodata = Geodata::updateOrCreate(
                        ['id' => $attributeValue->entity->geodata_id ?? null],
                        [
                            'geom' => Geodata::parseWkt($attributeValue->geography_wkt),
                            'color' => $color,
                            'user_id' => $user->id,
                        ]
                    );

                    if (!empty($attributeValue->entity) && !empty($geodata->id)) {
                        $entityGeodataMap[$attributeValue->entity->id] = $geodata->id;
                    }
                }

                self::updateEntityGeodataReferences($entityGeodataMap);
            });
    }
}
