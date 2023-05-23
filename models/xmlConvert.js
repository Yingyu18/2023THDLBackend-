let cleaner = require('./cleaners');
let tableFunc = require('./tableFunc');

tableFunc = new tableFunc();
cleaner = new cleaner();

class XMLConverter {

    toXML (js, corpus_name) {
        var len = Object.keys(js).length - 2;
        var cnt = 1;
        var xml = "<?xml version=\"1.0\"?><ThdlPrototypeExport>\n \
  <corpus name=\"" + corpus_name + "\">\n \
    <PageParameters>\n \
      <MaxCueItems Default=\"1200\"/>\n \
    </PageParameters>\n \
      <metadata_field_settings>\n\ ";
        var featAnal = "    <feature_analysis>\n";    
        var tags =  "";
        var docuheads = new Array(len).fill("");
        var docubodys = new Array(len).fill("");  
        var docuudef = new Array(len).fill("      <xml_metadata>\n");
        var docutags = new Array(len).fill("      <MetaTags>\n");
        var docuconts = new Array(len).fill("      <doc_content>\n");
        for (let i = 0; i < js["columns"].length; i++) {
          if (!js["xmlTags"][i].includes("metatags")){
            xml +="      <"+js["xmlTags"][i] + " show_spotlight=\"Y\">" + js["columns"][i] + "</" + js["xmlTags"][i] + ">\n";
            if (js["xmlTags"][i].includes("metadata")) {
              let dataname = js["xmlTags"][i].substring(9);
              for (let j = 1; j <= len; j++) {
                docuudef[j-1] += "        <" + dataname + ">" + js["file" + j][i] + "</" + dataname + ">\n" ;
              }
            } else if (js["xmlTags"][i]==="filename"){ 
              for (let j = 1; j <= len; j++) {
                docuheads[j-1] += "    <document filename=\"" + js["file" + j][i] + "\">\n      <corpus>" + corpus_name + "</corpus>\n";
              }
            } else if (js["xmlTags"][i]==="title") {
              for (let j = 1; j <= len; j++) {
                docuheads[j-1] += "      <title>" + js["file" + j][i] + "</title>\n";
              }
            } else if (js["xmlTags"][i]==="doc_content") {
              for (let j = 1; j <= len; j++) {
                docuconts[j-1] += "        " + js["file" + j][i] + "\n      </doc_content>\n";
              }
            } else if (js["xmlTags"][i]==="timeseq_not_before" || js["xmlTags"][i]==="timeseq_not_after") {
              for (let j = 1; j <= len; j++) {
                docuconts[j-1] += "      <" + js["xmlTags"][i] + ">" + js["file" + j][i].replaceAll("-", "") + "</" + js["xmlTags"][i] + ">\n";
              }
            } else {
              for (let j = 1; j <= len; j++) {
                docubodys[j-1] += "      <" + js["xmlTags"][i] + ">" + js["file" + j][i] + "</" + js["xmlTags"][i] + ">\n";
              }
            }
          } else {
            let tagName = js["xmlTags"][i].substring(9);
            featAnal += "      <spotlight category=\"Udef_"+ tagName + "\"  sub_category=\"-\" display_order=\"" + cnt + "\" title=\"" + js["columns"][i] + "/-\"/>\n";
            tags += "      <tag type=\"contentTagging\" name=\"Udef_"+ tagName + "\" default_category=\"Udef_" + tagName + "\" default_sub_category=\"-\"/>\n";
            cnt++;
            for (let j = 1; j <= len; j++) {
              let alltags = js["file" + j][i].split(";");
              for (let k = 0; k < alltags.length; k++) {
                docutags[j-1] += "        <Udef_" + tagName + ">" + alltags[k] + "</Udef_" + tagName + ">\n" ;
              }
            }
          }
        } 
        xml += "    </metadata_field_settings>\n" + featAnal + tags +"    </feature_analysis>\n" + "  </corpus>\n  \n  <documents>\n";
        for (let i = 0; i < len; i++) {
          xml += docuheads[i] + docubodys[i] + docuudef[i] + "      </xml_metadata>\n" + docuconts[i] + docutags[i] + "      </MetaTags>\n    </document>\n";
        }
        xml += "  </documents>\n</ThdlPrototypeExport>";
        return xml;       
    }
               
}

module.exports = XMLConverter;
