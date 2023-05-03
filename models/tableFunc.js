class tableFunc {

    async createNewTB (uid) {
        const pool = require('./connection_db');        
        console.log('building table for user: ' + uid);
            try {
                let conn = await pool.getConnection();
                var sql = "CREATE TABLE " + uid + " (fileID int NOT NULL primary key AUTO_INCREMENT, fileName nvarchar(255) NOT NULL, folder nvarchar(255), format nvarchar(255) NOT NULL, content LONGTEXT NOT NULL)";
                await conn.query(sql); 
                console.log('build success');
                conn.release(); 
            }
            catch (error) {
                console.log(error);
            }
        };

    async insertFile (uid, fileName, folder, content) {
        const pool = require('./connection_db');        
         console.log('insert file for user: ' + uid);
            try {
                let conn = await pool.getConnection();
                var ft = fileName.substr(fileName.length - 3);
                console.log('format = ' + ft);
                if (ft == 'son') {ft = 'j' + ft;} 
                var sql = "INSERT INTO " + uid + "(fileName, folder, format, content) VALUES (?, ?, ?, ?)";
                await conn.query(sql, [fileName, folder, ft, content]); 
                console.log('insert success');
                conn.release(); 
            }
            catch (error) {
                console.log(error);
            }
        };
    
    async openFile (uid, fileIDs) {
        const pool = require('./connection_db');        
        console.log('open fileID: ' + fileIDs + ' for user: ' + uid);
        var array = Array(fileIDs.length);
        try {            
            let conn = await pool.getConnection();
            let row;                
            var sql = "SELECT content FROM " + uid + " WHERE fileID = ?";
            for (let i = 0; i < fileIDs.length; i++) {
                row = await conn.query(sql, fileIDs[i]);
                array[i] = row[0].content; 
            }       
            conn.release(); 
            return array;
        }
        catch (error) {
            console.log(error);
        }
    };

    async deleteFile (uid, fileID) {
        const pool = require('./connection_db');        
         console.log('delete file for user: ' + uid);
            try {
                let conn = await pool.getConnection();
                var sql = "DELETE FROM " + uid + " WHERE fileID = ?";
                await conn.query(sql, fileID); 
                console.log('delete success');
                conn.release(); 
            }
            catch (error) {
                console.log(error);
            }
        };
    
}

module.exports = tableFunc;
