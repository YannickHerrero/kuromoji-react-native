/*
 * Copyright 2014 Takuya Asano
 * Copyright 2010-2014 Atilika Inc. and contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

var zlib = require("zlibjs/bin/gunzip.min.js");
var DictionaryLoader = require("./DictionaryLoader");

/**
 * ReactNativeDictionaryLoader inherits DictionaryLoader, using fetch for download.
 * Works with both remote URLs and local file:// URIs from expo-asset.
 * @param {string|Object} dic_path Dictionary path (URL base string or filename-to-URI map)
 * @constructor
 */
function ReactNativeDictionaryLoader(dic_path) {
    DictionaryLoader.apply(this, [dic_path]);
}

ReactNativeDictionaryLoader.prototype = Object.create(DictionaryLoader.prototype);

/**
 * Load a gzipped dictionary file and return the decompressed ArrayBuffer.
 * @param {string} url Dictionary file URL or local URI
 * @param {ReactNativeDictionaryLoader~onLoad} callback Callback function
 */
ReactNativeDictionaryLoader.prototype.loadArrayBuffer = function (url, callback) {
    fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.arrayBuffer();
        })
        .then(function (arraybuffer) {
            var gz = new zlib.Zlib.Gunzip(new Uint8Array(arraybuffer));
            var typed_array = gz.decompress();
            callback(null, typed_array.buffer);
        })
        .catch(function (err) {
            callback(err, null);
        });
};

/**
 * Callback
 * @callback ReactNativeDictionaryLoader~onLoad
 * @param {Object} err Error object
 * @param {Uint8Array} buffer Loaded buffer
 */

module.exports = ReactNativeDictionaryLoader;
