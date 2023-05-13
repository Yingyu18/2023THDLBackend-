let cleaner = require('./cleaners');
let tableFunc = require('./tableFunc');

tableFunc = new tableFunc();
cleaner = new cleaner();

class XMLConverter {

    toXML (js, corpus_name) {
        var len = Object.keys(js).length - 2;
        var cnt = 0;
        var xml = "<?xml version=\"1.0\"?><ThdlPrototypeExport> \
                     <corpus name=\"" + corpus_name + "\"> \
                       <PageParameters> \
                         <MaxCueItems Default=\"1200\"/> \
                       </PageParameters>"

        var mtField = "<metadata_field_settings>";
        var featAnal = "<feature_analysis>";
        var tags = new Array();
        var docArr = new Array(len);        
        var docArr = new Array(len);
        var xmlArr = new Array(len);
        var allArr = new Array(len);
        var tagArr = new Array(len);
        return xml;       
    }
               
}

module.exports = XMLConverter;
