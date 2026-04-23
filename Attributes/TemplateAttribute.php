<?php

namespace App\Plugins\Template\Attributes;

use App\AttributeTypes\AttributeBase;
use App\Exceptions\InvalidDataException;
use App\Utils\StringUtils;

class TemplateAttribute extends AttributeBase {
    protected static string $type = "template_attribute";
    protected static bool $inTable = true;
    protected static ?string $field = 'str_val';
    protected static ?string $label = 'plugin.template.attribute_name';


    public static function unserialize(mixed $data) : mixed {
        return $data;
    }

    public static function serialize(mixed $data) : mixed {
        return $data;
    }
}