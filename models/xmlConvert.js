let cleaner = require('./cleaners');
let tableFunc = require('./tableFunc');
const pool = require("./connection_db");
const {
  signUp,
  signupAuth,
  login,
  getUserDetail,
  updateUserInfo
} = require("./user_model");
tableFunc = new tableFunc();
cleaner = new cleaner();

class XMLConverter {

    cleanXmlStr(str) {
      str = str.replaceAll('&#40;', '（');
      str = str.replaceAll('&#41;', '）');
      str = str.replaceAll('&', '&amp;');
      str = str.replaceAll('<', '&lt;');
      str = str.replaceAll('>', '&gt;');
      str = str.replaceAll('"', '&quot;');
      str = str.replaceAll('`', '&apos;');
      return str;
    }

    async toXML (js, corpus_name, tagsArr) {
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
        let tagPre = '';
        if (tagsArr != '') {
          for (let i = 0; i < tagsArr.length; i++) {
            if (tagsArr[i] == 'PersonName' || tagsArr[i] == 'LocName' || tagsArr[i] == 'Date' || tagsArr[i] == 'Office') {tagPre = '';}
            else {tagPre = 'Udef_';}
            featAnal += "      <spotlight category=\""+ tagPre + tagsArr[i] + "\"  sub_category=\"-\" display_order=\"" + cnt + "\" title=\"" + tagPre + tagsArr[i] + "/-\"/>\n";
            tags += "      <tag type=\"contentTagging\" name=\""+ tagPre + tagsArr[i] + "\" default_category=\"" + tagPre + tagsArr[i] + "\" default_sub_category=\"-\"/>\n";
            cnt++
          }
        }
        var docuheads = new Array(len).fill("");
        var docubodys = new Array(len).fill("");  
        var docuudef = new Array(len).fill("      <xml_metadata>\n");
        var docutags = new Array(len).fill("      <MetaTags>\n");
        var docuconts = new Array(len).fill("      <doc_content>\n");
        for (let i = 0; i < js["columns"].length; i++) {
          if (js["xmlTags"][i] == null) {continue;}
          if (!js["xmlTags"][i].includes("metatags")){
            if (js["xmlTags"][i].includes("metadata")) {
              let dataname = js["xmlTags"][i].substring(9);
              xml +="      <"+ dataname + " show_spotlight=\"Y\">" + js["columns"][i] + "</" + dataname + ">\n";
              for (let j = 1; j <= len; j++) {
                if (js["file" + j][i] == null) {continue;}
                js["file" + j][i] = await this.cleanXmlStr(js["file" + j][i]);
                docuudef[j-1] += "        <" + dataname + ">" + js["file" + j][i] + "</" + dataname + ">\n" ;
              }
            } else if (js["xmlTags"][i]==="filename"){ 
              for (let j = 1; j <= len; j++) {
                if (js["file" + j][i] == null) {continue;}
                js["file" + j][i] = await this.cleanXmlStr(js["file" + j][i]);
                docuheads[j-1] += "    <document filename=\"" + js["file" + j][i] + "\">\n      <corpus>" + corpus_name + "</corpus>\n";
              }
            } else if (js["xmlTags"][i]==="title") {
              for (let j = 1; j <= len; j++) {
                if (js["file" + j][i] == null) {continue;}
                js["file" + j][i] = await this.cleanXmlStr(js["file" + j][i]);
                docuheads[j-1] += "      <title>" + js["file" + j][i] + "</title>\n";
              }
            } else if (js["xmlTags"][i]==="doc_content") {
              for (let j = 1; j <= len; j++) {
                if (js["file" + j][i] == null) {continue;}
                js["file" + j][i] = js["file" + j][i].replaceAll('<br>', '')
                js["file" + j][i] = js["file" + j][i].replaceAll('</br>', '')
                js["file" + j][i] = js["file" + j][i].replaceAll('<br/>', '')
                js["file" + j][i] = js["file" + j][i].replaceAll('<br />', '')
                docuconts[j-1] += "        " + js["file" + j][i];
              }
            } else if (js["xmlTags"][i]==="timeseq_not_before" || js["xmlTags"][i]==="timeseq_not_after") {
              for (let j = 1; j <= len; j++) {
                if (js["file" + j][i] == null) {continue;}
                js["file" + j][i] = await this.cleanXmlStr(js["file" + j][i]);
                docubodys[j-1] += "      <" + js["xmlTags"][i] + ">" + js["file" + j][i].replaceAll("-", "") + "</" + js["xmlTags"][i] + ">\n";
              }
            } else {
              xml +="      <"+js["xmlTags"][i] + " show_spotlight=\"Y\">" + js["columns"][i] + "</" + js["xmlTags"][i] + ">\n";
              for (let j = 1; j <= len; j++) {
                if (js["file" + j][i] == null) {continue;}
                js["file" + j][i] = await this.cleanXmlStr(js["file" + j][i]);
                docubodys[j-1] += "      <" + js["xmlTags"][i] + ">" + js["file" + j][i] + "</" + js["xmlTags"][i] + ">\n";
              }
            }
          } else {
            let tagName = js["xmlTags"][i].substring(9);
            tagName = tagName.replaceAll("/", '');
            tagName = tagName.replaceAll("(", '');
            tagName = tagName.replaceAll(")", '');
            featAnal += "      <spotlight category=\"Udef_"+ tagName + "\"  sub_category=\"-\" display_order=\"" + cnt + "\" title=\"" + js["columns"][i] + "/-\"/>\n";
            tags += "      <tag type=\"contentTagging\" name=\"Udef_"+ tagName + "\" default_category=\"Udef_" + tagName + "\" default_sub_category=\"-\"/>\n";
            cnt++;
            for (let j = 1; j <= len; j++) {
              if (js["file" + j][i] == null) {continue;}
              let alltags = js[String("file" + j)][i].split(";");
              for (let k = 0; k < alltags.length; k++) {
                docutags[j-1] += "        <Udef_" + tagName + ">" + await this.cleanXmlStr(alltags[k]) + "</Udef_" + tagName + ">\n" ;
              }
            }
          }
        } 
        xml += "    </metadata_field_settings>\n" + featAnal + tags +"    </feature_analysis>\n" + "  </corpus>\n  \n  <documents>\n";
        for (let i = 0; i < len; i++) {
          xml += docuheads[i] + docubodys[i] + docuudef[i] + "      </xml_metadata>\n" + docuconts[i] + docutags[i] + "      </MetaTags>\n      </doc_content>\n    </document>\n";
        }
        xml += "  </documents>\n</ThdlPrototypeExport>";
        return xml;       
    }

    async saveXML(xml, pid, uid, corpus_name, uname) {
      try {
        let conn = await pool.getConnection();
        let sql = "Select map_ID from sec_map where fileID = ?";
        let res = await conn.query(sql, [pid]);
        if (res == null || res[0] == null){
          let user = await getUserDetail(uid);
          res = await tableFunc.insertFile(uid, uname, corpus_name, xml, 'xml');
          sql = "Select fileID from file_DB where fileName = ? and type = \'xml\'";
          let fid = await conn.query(sql, [corpus_name]);
          sql = "Insert Into sec_map  (fileID, map_ID , sec_map) values (?, ?, ?)";  
          result = await conn.query(sql, [pid, fid[0].fileID, '']);
          sql = "UPDATE file_DB SET cores_xml_id = ? where fileID = ?";  
          result = await conn.query(sql, [fid[0].fileID, pid]);
          return fid[0].fileID;
        }
        else {
          sql = "UPDATE file_DB SET content = ?, lastModified = ? where fileID = ?" ;
          let tuirywe = await conn.query(sql, [xml, new Date().getTime().toString(), res[0].map_ID]);
          return res[0].map_ID;
        } 
        
      }  catch (error) {
      console.log(error);
    } 
  }       
}

module.exports = XMLConverter;
