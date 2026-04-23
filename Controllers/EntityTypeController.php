<?php
namespace App\Plugins\MapSync\Controllers;

use App\Attribute;
use App\AttributeValue;
use App\Entity;
use App\EntityType;
use App\Http\Controllers\Controller;

use DB;
use Illuminate\Http\Request;

use App\Plugins\MapSync\App\MapSync;

class EntityTypeController extends Controller {
    public function list() {
        $user = auth()->user();

        if (!$user->can('entity_type_read')) {
            return response()->json([
                'error' => __('You do not have the permission to read entity data'),
            ], 403);
        }

        $langId = 1;

        $entityTypes = EntityType::query()->with([
            'attributes:id,thesaurus_url,datatype',
            'attributes.thesaurus_concept.labels:id,concept_id,label,language_id',
            'attributes.thesaurus_concept:id,concept_url',

            'thesaurus_concept:id,concept_url',
            'thesaurus_concept.labels:concept_id,label,language_id'
        ])->orderBy('id')
            ->get();

        return response()->json($entityTypes);
    }

    public function sync(Request $request, EntityType $entityType, Attribute $attribute) {
        $user = auth()->user();

        if (!$user->can('attribute_read')) {
            return response()->json([
                'error' => __('You do not have the permission to read attribute data'),
            ], 403);
        }

        if (!$user->can('geodata_read') || !$user->can('geodata_write') || !$user->can('geodata_create') || !$user->can('geodata_delete')) {
            return response()->json([
                'error' => __('You do not have the permission to read or write geodata'),
            ], 403);
        }

        if (!$user->can('entity_type_read')) {
            return response()->json([
                'error' => __('You do not have the permission to read entity data'),
            ], 403);
        }

        if (!$user->can('entity_create') || !$user->can('entity_write')) {
            return response()->json([
                'error' => __('You do not have the permission to import entity data'),
            ], 403);
        }

        DB::beginTransaction();
        // Get List of all entities of entity type and update all attribute values
        // for the given attribute entity combination to the AttributeValue
        try {
            MapSync::createOrUpdateGeometries($entityType, $attribute);
            MapSync::removeOrphanedGeodata($entityType, $attribute);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => __('An error occurred during synchronization: ') . $e->getMessage(),
            ], 500);
        }

        DB::commit();

        return response()->json([
            'message' => __('Synchronization completed successfully'),
        ]);

    }
}