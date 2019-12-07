const express=require('express');
const cors = require('cors');
const morgan = require('morgan')
var app=express();
app.use(express.json());
app.use(cors());
app.use(morgan());
var MongoClient = require('mongodb').MongoClient;
app.get('/api/student_info_db/co_op/:stu_id',(req,res)=>{
    var url ="mongodb://localhost:27017/";
    let stu_id = req.params.stu_id;
    MongoClient.connect(url,{ useUnifiedTopology: true }, function(err, db) {
        if(err) return res.status(500).json({
            status : false,
            message : err.message
        });
        var dbo = db.db("student_info_db");
        console.log('here', err)
        dbo.collection("co_op").findOne({s_id : stu_id}, function(err, result) {
            // db.close();
            if(err) return res.status(500).json({
                status : false,
                message : err.message
            });
            else if (result){
                console.log('result', result);
                return res.status(200).json({
                    status : true,
                    data : result
                });
            }
            return res.status(200).json({
                status : true,
                message : 'No student associated with this student id'
            });
        });
    });

});
// get service to retrieve co_op collection data
app.get('/api/student_info_db/co_op',(req,res)=>{
    var url ="mongodb://localhost:27017/";
    MongoClient.connect(url, function(err, db) {
        if(err) return res.status(500).json({
            status : false,
            message : err.message
        });
        var dbo = db.db("student_info_db");
        dbo.collection("co_op").find({}).toArray( function(err, result) {
            db.close();
            if(err) return res.status(500).json({
                status : false,
                message : err.message
            });
            console.log(result);
            return res.status(200).json({
                status : true,
                data : result
            });
        });
    });

});


// post service to insert data into co_op collection 
app.post('/api/co_op/',(req,res)=>{
var url = "mongodb://localhost:27017/";
let {stu_id, cname, start_date, end_date} = req.body;
if(!stu_id || !cname || !start_date || !end_date  ){
    let msg;
    if(!stu_id || stu_id === '') msg = 'Student Id is required';
    else if(!cname || cname === '') msg = 'Company Name(cname) is required';
    else if(!start_date || start_date === '') msg = 'Start Date is required';
    else if(!end_date || end_date === '') msg = 'End Date is required';
    console.log('msg', msg);
    return res.status(400).json({
        status : false,
        message : msg
    })
}
MongoClient.connect(url,{useUnifiedTopology: true }, function(err, db) {
    if (err) throw err;
  var dbo = db.db("student_info_db");
  var newStudent = { s_id:stu_id,company_name:cname,start_date,end_date};
  dbo.collection("co_op").findOne({s_id:stu_id}, function(err, student) {
    if(err) return res.status(500).json({
        status : false,
        message : err.message
    });
    if(student!== null && Object.keys(student).length > 0){
       return res.status(409).json({
           status: false,
           message : 'User with this student id already exists!'
       })
    }
    dbo.collection("co_op").insertOne(newStudent, function(err, result) {
        if(err) return res.status(500).json({
            status : false,
            message : err.message
        });
        console.log("1 document inserted");
        db.close();
        return res.status(200).json({
            status : false,
            message : 'User successfully created'
        })
    });
  })

});
});


// put service to update data in co_op collection data
app.put('/api/co_op/',(req,res)=>{
    let {stu_id, cname, start_date, end_date} = req.body;
    if(!stu_id || !cname || !start_date || !end_date  ){
        let msg;
        if(stu_id) msg = 'Student Id is required';
        else if(!cname || cname === '') msg = 'Company Name(cname) is required';
        else if(!start_date || start_date === '') msg = 'Start Date is required';
        else if(!end_date || end_date === '') msg = 'End Date is required';
        console.log('msg', msg);
        return res.status(400).json({
            status : false,
            message : msg
        })
    }
    var url = "mongodb://127.0.0.1:27017/";
    MongoClient.connect(url, function(err, db) {
        if(err) res.status(500).json({
            status : false,
            message : err.message
        });
        var dbo = db.db("student_info_db");
        var myquery = { s_id: stu_id };
        var newvalues = { $set: { company_name:cname, start_date, end_date }};
        dbo.collection("co_op").updateOne(myquery, newvalues, function(err, result) {
            console.log('result', result);
            if(err) res.status(500).json({
                status : false,
                message : err.message
            });
            return res.status(200).json({
                status : false,
                message : 'Student successfully updated'
            })
        db.close();
    });
});
})


app.delete('/api/co_op/',(req,res)=>{
    var url = "mongodb://localhost:27017/";
    let {stu_id} = req.body;
    if(!stu_id) return res.status(400).json({
        status : false,
        message : 'Student id is required'
    })
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("student_info_db");
        var myquery = { s_id: stu_id };
        dbo.collection("co_op").deleteOne(myquery, function(err, obj) {
            if(err) res.status(500).json({
                status : false,
                message : err.message
            });
            db.close();
            console.log("1 document deleted from Hospital collection");
            return res.status(200).json({
                status : true,
                message : 'Student successfully deleted!'
            })
        });
    });
});




const port=process.env.PORT ||8081;
app.listen(port,()=>console.log(`Listening to port ${port}..`));