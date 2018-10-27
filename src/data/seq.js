#!/usr/bin/env node
var models = require("./models");
function addItem(items,item){
	console.log(items);
	console.log(item);
    find=false
    for(var ii=0;ii<items.length;ii++)// i in items:
    {
    	let i=items[ii];
        if (i.id==item.id){
            i.leijia=true
            i.ct +=item.ct
            find=true
            break
        }
    }
    if (!find){
        items.push(item)
    }
    console.log(items);
    return items
}
async function huizong(contact){
        let items=[]
        let items2=[]
        var w = {
					contact_id: contact.id
				};
		var ups = await models.UsePack.findAll({
			where: w
		})
        for(var i=0;i<ups.length;i++)// cp in contact.usepack_set.all():
        {
        	let w2 = {pack_id: ups[i].pack_id};
			var pis = await models.PackItem.findAll({
				where: w2,
				include: [{
						model: models.Item,
				}],
			})
			for(var j=0;j<pis.length;j++){

				let pi=pis[j];console.log(pi);
                pi.Item.ct=pi.ct
                if (!pi.quehuo){
                    items=addItem(items,pi.Item)
                }
                else{
                    items2=addItem(items2,pi.Item)
                }
			}
        }
        return [items,items2]
}
function DateStr(date) {
	console.log(date);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var s_month=""+month;
    if (s_month.length<2) s_month="0"+s_month;
    var day = date.getDate();
    var s_day=""+day;
    if (s_day.length<2) s_day="0"+s_day;
    return year + "-" + s_month + "-" + s_day ;
}
var funcs={}
class socket{
    static on(url,cb){
        funcs[url]=cb;
        // console.log(url);
    }
    static emit(url,data,callback){
    	console.log(url);
        funcs[url](data,callback);
    }
}
socket.init=(callback)=>{
models.sequelize.sync().then(
	function () {
			socket.on('/post/standard', function( data, callback ) {
				console.log("/post/standard");
				console.log(data);
				callback({
					success:true,
					data:[],
					message: "delete Contact ok"
				});

			}); 
   			socket.on('/get/showcontact', async function( data, callback ) {
   				console.log(data);
   				var contact = await models.Contact.findById(data.id); //.then(function(packitem) {
				let arr1=await huizong(contact);
				console.log(arr1);
				let items=arr1[0];
				let items2=arr1[1];
				console.log(arr1[0]);
				console.log(arr1[1]);
				let totalct=0
				let totalid=items.length;
			    for(var i=0;i<items.length;i++){
			        totalct +=items[i].ct;
			    }
				callback({
					success:true,
					contact:contact,
					items:items,
					items2:items2,
					totalct:totalct,
					totalid:totalid,
					message: "showcontact ok"
				});
   			});
			socket.on('/get/year12', async function( data, callback ) {
			    var baoxiang=data.baoxiang;
			   	var end_date=new Date();
			    var start_date=new Date();//datetime.datetime(end_date.year-1,1,1,0,0,0)
			    start_date.setYear(start_date.getFullYear()-10);
			    start_date.setMonth(0);
			    start_date.setDate(1);

			    // cursor = connection.cursor()            #获得一个游标(cursor)对象
			    // #更新操作
			    var start_date_s= DateStr(start_date);
			    var end_date_s= DateStr(end_date);
			    let cmd;
			    if (baoxiang==null)
			         cmd="select strftime('%Y',tiaoshi_date) as month,count(id) as ct  from parts_contact  where tiaoshi_date between '"+start_date_s+"' and '"+end_date_s+"' group by month"
			    else
			         cmd="select strftime('%Y',tiaoshi_date) as month,count(id) as ct from parts_contact  where baoxiang like '"+baoxiang+"'  and tiaoshi_date between '"+start_date_s+"' and '"+end_date_s+"' group by month"            
				console.log(cmd);
			    var cursor=await models.sequelize.query(cmd)
			    console.log(cursor[0]);
			    // logging.info(cmd)
			    // cursor.execute(cmd)    #执行sql语句
			    // raw = cursor.fetchall()                 #返回结果行 或使用 #raw = cursor.fetchall()		
			    var lbls=[];
			    var values=[]
			    for (var i in cursor[0])				 
			    {
			    	lbls.push(cursor[0][i].month)
			    	values.push(cursor[0][i].ct)
			    }
				callback({
					success:true,lbls:lbls,values:values,
				});
			});
			socket.on('/get/month12', async function( data, callback ) {
			    var baoxiang=data.baoxiang;
			   	var end_date=new Date();
			    var start_date=new Date();//datetime.datetime(end_date.year-1,1,1,0,0,0)
			    start_date.setYear(start_date.getFullYear()-3);
			    start_date.setMonth(0);
			    start_date.setDate(1);

			    // cursor = connection.cursor()            #获得一个游标(cursor)对象
			    // #更新操作
			    var start_date_s= DateStr(start_date);
			    var end_date_s= DateStr(end_date);
			    let cmd;
			    if (baoxiang==null)
			         cmd="select strftime('%Y-%m',tiaoshi_date) as month,count(id) as ct  from parts_contact  where tiaoshi_date between '"+start_date_s+"' and '"+end_date_s+"' group by month"
			    else
			         cmd="select strftime('%Y-%m',tiaoshi_date) as month,count(id) as ct from parts_contact  where baoxiang like '"+baoxiang+"'  and tiaoshi_date between '"+start_date_s+"' and '"+end_date_s+"' group by month"            
				console.log(cmd);
			    var cursor=await models.sequelize.query(cmd)
			    console.log(cursor[0]);
			    // logging.info(cmd)
			    // cursor.execute(cmd)    #执行sql语句
			    // raw = cursor.fetchall()                 #返回结果行 或使用 #raw = cursor.fetchall()		
			    var lbls=[];
			    var values=[]
			    for (var i in cursor[0])				 
			    {
			    	lbls.push(cursor[0][i].month)
			    	values.push(cursor[0][i].ct)
			    }
				callback({
					success:true,lbls:lbls,values:values,
				});
			});
			socket.on('/parts/showcontact', async function( data, callback ) {	
				var contact = await models.Contact.findById(data.id); //.then(function(packitem) {
				callback({
					data: contact,
					message: "show  Contact ok"
				});
			}); //delete
			//route.delete('/rest/Contact/:contact_id', async function(ctx,next) {
			socket.on('/delete/Contact', async function( data, callback ) {	
				var contact = await models.Contact.findById(data.contact_id); //.then(function(packitem) {
				contact.destroy();
				callback({
					data: [],
					message: "delete Contact ok"
				});
			}); //delete
			//route.post('/rest/Contact', async function(ctx,next) {
			socket.on('/post/Contact', async function( data, callback ) {		
				let  contact;
				try{
					contact=await models.Contact.create(data);
					callback({
						success:true,
						data: contact,
						message: "create Contact ok"
					});
				}
				catch(e){
					console.log(e);
					for(var i in e){
						console.log(i)
					}
					callback({
						success:false,
						message: e.message,
						error:e
					});

				}
			
			});
			//route.put('/rest/Contact', async function(ctx,next) {
			socket.on('/put/Contact', async function( data, callback ) {			
				var contact = await models.Contact.findById(data.id); //.then(function(packitem) {
				contact.update(data);
				contact.save();
				callback({
					success:true,
					data: contact,
					message: "update  Contact ok"
				});
			});
			//route.get('/rest/Contact', async function(ctx,next) {
			socket.on('/get/Contact', async function( data, callback ) {				
				var start = data.start;
				var limit = data.limit;
				let search="",filter_danwei="";
				if(data.filter_danwei){
					filter_danwei=data.filter_danwei;
				}
				if(data.search)
					search = data.search;
				var baoxiang = '';
				if (data.baoxiang) {
					baoxiang = data.baoxiang;
				}
				var w = {};
				if (data.yiqibh && data.yiqibh!="") {
					w.yiqibh ={
							$like: "%" + data.yiqibh + "%"
						};
				}
				if (search!=""){
					w.hetongbh ={
							$like: "%" + search + "%"
						};
				}
				if (filter_danwei!=""){
					w.yonghu={
							$like: "%" + filter_danwei + "%"
						};
				}
				if (baoxiang!=""){
					w.baoxiang={
							$like: "%" + baoxiang + "%"
						};
				}
				console.log(w);
				var datas = await models.Contact.findAll({
						attributes: [
							[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
						],
						where: w
					})
					//ctx.body=datas;
				var total = datas[0].dataValues.total;
				console.log("total=" + total);
				var contacts = await models.Contact.findAll({
					where: w,
					limit: limit,
					offset: start,
					order: [['yujifahuo_date','DESC']]
				});
				for(var i=0;i<contacts.length;i++){
					contacts[i]=contacts[i].dataValues;
				}
				callback({
					data: contacts,
					total: total
				});
			});
			//UsePack//////////////////////////////////////////////////////////////////////
			//route.delete('/rest/UsePack/:contact_id', async function(ctx) {
			socket.on('/delete/UsePack', async function( data, callback ) {				
				var contact = await models.UsePack.findById(data.id); //.then(function(packitem) {
				contact.destroy();
				callback({
					data: [],
					message: "delete UsePack ok"
				});
			}); //delete
			//route.post('/rest/UsePack', async function(ctx,next) {
			socket.on('/post/UsePack', async function( data, callback ) {				
				var data1={};
				data1.contact_id=data.contact;
				data1.pack_id=data.pack;
				var contact = await models.UsePack.create(data1);
				var pack = await contact.getPack();
				contact.dataValues["Pack"] = pack;
				contact.name=pack.name;
				contact.pack=pack.id;
				callback({
					data: contact,
					message: "create UsePack ok"
				});
			});
			//route.put('/rest/UsePack', async function(ctx,next) {
			socket.on('/put/UsePack', async function( data, callback ) {
				console.log(data);				
				var contact = await models.UsePack.findById(data.id); //.then(function(packitem) {
				contact.update(data);
				contact.save();
				callback({
					data: contact,
					message: "update  UsePack ok"
				});
			});
			socket.on('/post/UsePackEx', async function( data, callback ) {				
				console.log(data);	
				var rec1 = await models.Pack.create(data)
				var rec = await models.UsePack.create({contact_id:data.contact,pack_id:rec1.id})
				rec.dataValues["Pack"] = rec1;
				rec.name=rec1.name;
				rec.pack=rec1.id;
				callback({
					data: rec,
					message: "create UsePack ok"
				});
			 });
			
			socket.on('/put/BothPackItem', async function( data, callback ) {				
				console.log("BothPackItem");
				console.log(data);
				var item = await models.Item.findById(data.itemid); //.then(function(packitem) {
				item.update(data);
				item.save();
				var packitem = await models.PackItem.findById(data.id); //.then(function(packitem) {
				packitem.update(data);
				packitem.save();
				packitem.name=item.name
					packitem.guige=item.guige
					packitem.bh=item.bh
					packitem.danwei=item.danwei
					packitem.itemid=item.id
				callback({
					data: packitem,
					message: "create PackItem ok"
				});
			 });

			socket.on('/post/BothPackItem', async function( data, callback ) {				
				console.log(data);	
				if(!data.ct) data.ct=0;
				if(!data.danwei) data.danwei="";
				var rec1 = await models.Item.create(data)
				var rec = await models.PackItem.create({pack_id:data.pack,item_id:rec1.id,ct:1,quehuo:false})
				rec.dataValues["Item"] = rec1;
					rec.name=rec1.name
					rec.guige=rec1.guige
					rec.bh=rec1.bh
					rec.danwei=rec1.danwei
					rec.itemid=rec1.id
				callback({
					data: rec,
					message: "create PackItem ok"
				});
			 });
			socket.on('/get/UsePack', async function( data, callback ) {	
				console.log(data);
				var start = data.start;
				var limit = data.limit;
				var search = data.search;
				var w = {
					contact_id: data.contact
				};
				var datas = await models.UsePack.findAll({
					attributes: [
						[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					],
					where: w
				})
				var total = datas[0].dataValues.total;
				console.log("total=" + total);
				var contacts = await models.UsePack.findAll({
					where: w,
					limit: limit,
					offset: start,
					include: [{
						model: models.Pack,
					}],
				})
				let res=[];
				for(var i=0;i<contacts.length;i++){
					res[i]=contacts[i].dataValues;
					res[i].name=contacts[i].Pack.name;
					res[i].pack=contacts[i].Pack.id;
				}
				callback({
					data: res,
					total: total
				});
			});
			//PackItem//////////////////////////////////////////////////////////////////////
			//route.delete('/rest/PackItem/:contact_id',  async function(ctx,contact_id) {
			socket.on('/delete/PackItem', async function( data, callback ) {				
				var contact = await models.PackItem.findById(data.id); //.then(function(packitem) {
				contact.destroy();
				callback({
					data: [],
					message: "delete PackItem ok"
				});
			}); //delete
			//route.post('/rest/PackItem', async function(ctx,next) {
			socket.on('/post/PackItem', async function( data, callback ) {	
				console.log(data);//pack itemid
				let data1={pack_id:data.pack,item_id:data.itemid,quehuo:false,ct:1};
				var pi = await models.PackItem.create(data1)
				var i = await pi.getItem();
				pi=pi.dataValues;
				pi.name=i.name
					pi.guige=i.guige
					pi.bh=i.bh
					pi.danwei=i.danwei
					pi.itemid=i.id
				callback({
					data: pi,
					message: "create UsePack ok"
				});
			});
			//route.put('/rest/PackItem/:id',async  function(ctx,next) {
			socket.on('/put/PackItem', async function( data, callback ) {				
				console.log(data.id);
				var packitem = await models.PackItem.findById(data.id, {
					include: [{
						model: models.Item,
					}],
				}); //.then(function(packitem) {
				console.log("==============================");
				console.log(packitem);
				packitem.update(data);
				packitem.Item.save();
				packitem.save();
				console.log(packitem);
				callback({
					data: packitem,
					message: "update packitem ok"
				});
			}); //update
			// route.put('/rest/PackItem/:id', function*(id) {
			// 	var contact = await models.PackItem.findById(id); //.then(function(packitem) {
			// 	contact.update(data);
			// 	contact.save();
			// 	callback({
			// 		data: contact,
			// 		message: "update  PackItem ok"
			// 	};
			// }));
			//route.get('/rest/PackItem', async function(ctx,next) {
			socket.on('/get/PackItem', async function( data, callback ) {	
				console.log("/get/PackItem");			
				console.log(data);
				var start = data.start;
				var limit = data.limit;
				let search="";
				if(data.search) search = data.search;
				var w = {
					pack_id: data.pack
				};
				var datas = await models.PackItem.findAll({
					attributes: [
						[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					],
					where: w
				})
				var total = datas[0].dataValues.total;
				console.log("total=" + total);
				var contacts = await models.PackItem.findAll({
					where: w,
					limit: limit,
					offset: start,
					include: [{
						model: models.Item,
					}],
				})
				let res=[]
				for(var i=0;i<contacts.length;i++){
					res[i]=contacts[i].dataValues;
					res[i].name=contacts[i].Item.name
					res[i].guige=contacts[i].Item.guige
					res[i].bh=contacts[i].Item.bh
					res[i].danwei=contacts[i].Item.danwei
					res[i].itemid=contacts[i].Item.id
				}
				callback({
					data: res,
					total: total
				});
			});
			//Pack
			//route.post('/rest/Pack', async function(ctx,next) {
			socket.on('/post/Pack', async function( data, callback ) {				
				var data = await models.Pack.create(data);
				callback({
					data: data,
					message: "create pack ok"
				});
			});
			socket.on('/post/copypack', async function( data, callback ) {				
				let dic1={}
				data.forEach((v,name)=>{
					dic1[name]=v;
				});
				console.log(dic1);
				// var oldpack = await models.Pack.findById(dic1.oldid); //.then(function(packitem) {
				var newpack = await models.Pack.create({name:dic1.newname});
				var w = {
					pack_id: parseInt(dic1.oldid)
				};
				var pis = await models.PackItem.findAll({
					where: w
				})
				console.log(pis);
				for(var i=0;i<pis.length;i++){
					var pi1 = await models.PackItem.create({
						quehuo:pis[i].quehuo
						,ct:pis[i].ct
						,pack_id:newpack.id
						,item_id:pis[i].item_id
					});
				}
				callback({
					success:true,
					message: "copy pack ok"
				});
			});
			//route.get('/rest/Pack', async function(ctx,next) {
			socket.on('/get/Pack', async function( data, callback ) {				
				console.log(data);
				var start = data.start;
				var limit = data.limit;
				var search = data.search;
				var w = null;
				if (search && search != "") {
					w = {
						name: {
							$like: "%" + search + "%"
						},
					};
				} else {
					w = {};
				}
				console.log(w);
				var datas = await models.Pack.findAll({
					attributes: [
						[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					],
					where: w
				});
				var total = datas[0].dataValues.total;
				console.log("total=" + total);
				var contacts = await models.Pack.findAll({
					where: w,
					limit: limit,
					offset: start,
					order: [['id','DESC']]
				});
				if (contacts.length > 0) {
					callback({
						data: contacts,
						total: total
					});
				} else {
					callback({
						data: contacts,
						total: 0
					});
				}
			});
			//Item
			//route.post('/rest/Item', async function(ctx,next) {
			socket.on('/post/Item', async function( data, callback ) {				
				var data = await models.Item.create(data);
				callback({
					data: data,
					message: "create item ok"
				});
			});
			socket.on('/put/Item', async function( data, callback ) {				
				console.log(data);
				var item = await models.Item.findById(data.id);
				item.update(data);
				// item.dataValues=data.dataValues;
				item.save();
				callback({
					data: item.dataValues,
					message: "update item ok"
				});
			});
			//route.get('/rest/Item', async function(ctx,next) {
			socket.on('/get/Item', async function( data, callback ) {				
				console.log(data);
				var start = data.start;
				var limit = data.limit;
				var search = data.search;
				var w = null;
				if (search && search != "") {
					w = {
						name: {
							$like: "%" + search + "%"
						},
					};
				} else {
					w = {};
				}
				console.log(w);
				var datas = await models.Item.findAll({
					attributes: [
						[models.sequelize.fn('COUNT', models.sequelize.col('id')), 'total'],
					],
					where: w
				});
				var total = datas[0].dataValues.total;
				console.log("total=" + total);
				var contacts = await models.Item.findAll({
					where: w,
					limit: limit,
					offset: start,
					order: [['id','DESC']]
				});
				for(var i=0;i<contacts.length;i++){
					contacts[i]=contacts[i].dataValues;
				}
				if (contacts.length > 0) {
					callback({
						data: contacts,
						total: total
					});
				} else {
					callback({
						data: contacts,
						total: 0
					});
				}
			});
			callback();

	}
).catch(err=>{
    console.log(err);
});
}
module.exports=socket;