var recursive = require("recursive-readdir");
const get_files = (path,callback) => {
    recursive(path, function(err,files) {
        if (!err) {
            callback(files);
        } else {
            callback([]);
        }
    })
}

export default {
    get_files: get_files
};