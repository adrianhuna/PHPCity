<?php
function parseNode($ast, $data) {
    if (! $ast instanceof ast\Node) {
        return;
    }

    $kind = ast\get_kind_name($ast->kind);

    switch($kind) {
        case 'AST_NAMESPACE':
            $data['namespace'] = $ast->children['name'];
            break;
        case 'AST_CLASS':
            $data['name']        = $ast->name;
            $data['extends']     = $ast->children['extends']->children['name'];
            $data['implements']  = $ast->children['implements']->children[0]->children['name'];
            $data['no_lines']    = $ast->endLineno - $ast->lineno;
            $data['no_attrs']    = countType($ast->children['stmts'], 'AST_PROP_DECL');
            $data['no_methods']  = countType($ast->children['stmts'], 'AST_METHOD');

            $data = determineFlags($ast, $data);
            break;
    }

    return $data;
}

function countType($ast, $type) {
    $count = 0;

    if ($ast instanceof ast\Node) {
        foreach ($ast->children as $i => $child) {
            if (ast\get_kind_name($child->kind) == $type) {
                $count++;
            }
        }
    }

    return $count;
}

function determineFlags($ast, $data) {
    $flags = format_flags($ast->kind, $ast->flags);

    $data['abstract']  = strpos($flags, 'CLASS_ABSTRACT') !== false;
    $data['final']     = strpos($flags, 'CLASS_FINAL') !== false;
    $data['trait']     = strpos($flags, 'CLASS_TRAIT') !== false;
    $data['type']      = strpos($flags, 'CLASS_INTERFACE') !== false ? 'interface' : 'class';
    $data['anonymous'] = strpos($flags, 'CLASS_ANONYMOUS') !== false;

    return $data;
}

function generateJSONFile($finalData, $projectName) {
    $fileName   = mb_ereg_replace("([^\w\s\d\-_~,;\[\]\(\).])", '-', $projectName);
    $fileHandle = fopen('./output/' . $fileName . '.json', 'w');

    fwrite($fileHandle, json_encode($finalData));

    return $fileName;
}
