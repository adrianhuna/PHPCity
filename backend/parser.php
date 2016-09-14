<?php
require 'util.php';
require 'functions.php';

error_reporting(E_ERROR | E_WARNING | E_PARSE);

print "Please input path to folder with files that will be processed: ";

$fp       = fopen('php://stdin', 'r');
$baseDir  = trim(fgets($fp, 1024));
$project  = preg_replace('/\//', '-', $baseDir);

try {
    $directory = new RecursiveDirectoryIterator($baseDir);
} catch (UnexpectedValueException $e) {
    print "The folder could not be found!\n";
    die;
}

$iterator  = new RecursiveIteratorIterator($directory);
$regex     = new RegexIterator($iterator, '/^.+\.php$/i', RecursiveRegexIterator::GET_MATCH);

$finalData = [];

foreach ($regex as $name => $object) {
    $data = [
        "file"    => preg_replace("/^". preg_quote($baseDir . '\\', '/') . "/", '', $name, 1)
    ];

    $ast = ast\parse_file($name, $version=30);

    // list of nodes in file
    if ($ast instanceof ast\Node) {
        foreach ($ast->children as $i => $child) {
            $data = parseNode($child, $data);
        }
    }

    if (! isset($data['type'])) {
        continue;
    }

    array_push($finalData, $data);
}

$fileName = generateJSONFile($finalData, $project);

print '** JSON file generated: ./output/' . $fileName . ".json\n";
