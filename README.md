kuromoji-react-native
=====================

React Native (Expo) compatible fork of [kuromoji.js](https://github.com/takuyaa/kuromoji.js), a JavaScript implementation of a Japanese morphological analyzer.

This fork replaces the Node.js and browser-specific dictionary loading with a `fetch()`-based loader that works in React Native's Hermes engine. The core tokenizer is unchanged, as it was already pure JavaScript.


What changed from upstream
--------------------------

Only the dictionary loading layer was modified (3 files). The tokenizer core (~20 files) is untouched.

- `DictionaryLoader.js`: removed `require("path")`, added `resolvePath()` supporting both URL strings and asset maps
- `ReactNativeDictionaryLoader.js`: new loader using `fetch()` + `zlibjs`, works with both remote URLs and local `file://` URIs
- `TokenizerBuilder.js`: imports the React Native loader by default


Installation
------------

Install from GitHub:

    npx expo install kuromoji-react-native@github:YannickHerrero/kuromoji-react-native

The dictionary files (~17MB compressed) are included in the package under `dict/`.


Setup
-----

### 1. Configure Metro to bundle .gz files

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('gz');
module.exports = config;
```

### 2. Register dictionary assets

Metro requires static `require()` calls, so each file must be listed explicitly:

```js
import { Asset } from 'expo-asset';

const DICT_ASSETS = {
  'base.dat.gz': require('kuromoji-react-native/dict/base.dat.gz'),
  'check.dat.gz': require('kuromoji-react-native/dict/check.dat.gz'),
  'tid.dat.gz': require('kuromoji-react-native/dict/tid.dat.gz'),
  'tid_pos.dat.gz': require('kuromoji-react-native/dict/tid_pos.dat.gz'),
  'tid_map.dat.gz': require('kuromoji-react-native/dict/tid_map.dat.gz'),
  'cc.dat.gz': require('kuromoji-react-native/dict/cc.dat.gz'),
  'unk.dat.gz': require('kuromoji-react-native/dict/unk.dat.gz'),
  'unk_pos.dat.gz': require('kuromoji-react-native/dict/unk_pos.dat.gz'),
  'unk_map.dat.gz': require('kuromoji-react-native/dict/unk_map.dat.gz'),
  'unk_char.dat.gz': require('kuromoji-react-native/dict/unk_char.dat.gz'),
  'unk_compat.dat.gz': require('kuromoji-react-native/dict/unk_compat.dat.gz'),
  'unk_invoke.dat.gz': require('kuromoji-react-native/dict/unk_invoke.dat.gz'),
};

export async function loadDictAssets() {
  await Asset.loadAsync(Object.values(DICT_ASSETS));
  const assetMap = {};
  for (const [name, mod] of Object.entries(DICT_ASSETS)) {
    assetMap[name] = Asset.fromModule(mod).localUri;
  }
  return assetMap;
}
```

### 3. Use the tokenizer

```js
import kuromoji from 'kuromoji-react-native';
import { loadDictAssets } from './dict-assets'; // the file from step 2

const assetMap = await loadDictAssets();
const tokenizer = await kuromoji.builder({ dicPath: assetMap }).build();
const tokens = tokenizer.tokenize("すもももももももものうち");
console.log(tokens);
```

You can also pass a remote URL base path instead of an asset map:

```js
const tokenizer = await kuromoji.builder({ dicPath: "https://cdn.example.com/dict/" }).build();
```

A callback-based API is also supported:

```js
kuromoji.builder({ dicPath: assetMap }).build((err, tokenizer) => {
  // ...
});
```


API
---

The `tokenize()` function returns a JSON array:

```json
[{
    "word_id": 509800,
    "word_type": "KNOWN",
    "word_position": 1,
    "surface_form": "黒文字",
    "pos": "名詞",
    "pos_detail_1": "一般",
    "pos_detail_2": "*",
    "pos_detail_3": "*",
    "conjugated_type": "*",
    "conjugated_form": "*",
    "basic_form": "黒文字",
    "reading": "クロモジ",
    "pronunciation": "クロモジ"
}]
```

See `src/util/IpadicFormatter.js` for the full definition.


Memory usage
------------

Once loaded, the dictionary data uses ~40MB of RAM. This is fine for most apps: load the tokenizer once when needed and keep it in memory for the session.


License
-------

Apache-2.0 (same as upstream kuromoji.js)
