var mongoose=require('mongoose');
//var mongoDB = 'mongodb://127.0.0.1/products';
const mongoDB = 'mongodb://localhost:27017/products';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log('MongoDB connected'))
   .catch((err) => console.error('MongoDB connection error:', err));
var db=mongoose.connection;
db.on('error',console.error.bind(console,"mongoDB connection error"));

var productionSchema=mongoose.Schema({
    pid: Number,
    name: String,
    description: String,
    price: Number,
    category: String
});

var product = mongoose.model('product', productionSchema , 'product');
//var mongoose=require('mongoose');
 
const fastify=require('fastify')({logger:true});
const PORT=3000

//swagger
//fastify.register(require('fastify-swagger'),{
//   exposeRoute:true,
//    routerPrefix:'/docs',
//    swagger:{
//        info:{title:'product-fastify-api'},
//   }
//});

fastify.get('/hello',(req,resp)=>{
    resp.send({'hello':'world'});
});

//read all products
fastify.get('/products', async (req, resp) => {
    try {
        const results = await product.find().lean().select("pid name description price category");
        resp.send(results);
    } catch (err) {
        // Handle any errors that occur during the database query
        console.error(err);
        resp.status(500).send({ error: 'Internal Server Error' });
    }
});

//read product by sing pid
fastify.get('/products/:pid', async (req, resp) => {
    try {
        const pid = req.params;
        const results = await product.find({ 'pid': pid }).lean().select("pid name description price category");
        resp.send(results);
    } catch (err) {
        console.error(err);
        resp.status(500).send({ error: 'Internal Server Error' });
    }
});


//create

fastify.post('/products', async (req, resp) => {
    try {
      const { pid, name, price, description, category } = req.body;
  
      // Create a new product instance
      const newProduct = new product({
        pid,
        name,
        price,
        description,
        category,
      });
      const savedProduct = await newProduct.save();

    console.log(`${savedProduct.name} saved to the database`);
    resp.code(201).send(savedProduct);
} catch (err) {
    console.error(err);
    resp.code(500).send({ error: 'Failed to create a new product' });
  }
});
  

//delete product

fastify.delete('/products/:pid', async (req, resp) => {
    const { pid } = req.params;
    const filter = { pid: pid };

    try {
        const prod = await product.findOneAndDelete(filter);
        if (!prod) {
            resp.status(404).send(`Product ID ${pid} not found`);
        } else {
            resp.send(`Product ID ${pid} removed successfully`);
        }
    } catch (err) {
        console.error(err);
        resp.status(500).send('Error removing product: ' + err.message);
    }
});



//update
fastify.put('/products/:pid', async (req, resp) => {
    try {
        const { pid } = req.params;
        const { name, description } = req.body;

        const filter = { pid: pid };
        const update = { name: name, description: description };

        const updatedProduct = await product.findOneAndUpdate(filter, update, { new: true });

        if (!updatedProduct) {
            resp.status(404).send(`Product ID ${pid} not found`);
        } else {
            resp.send(`Product ID ${pid} updated successfully`);
        }
    } catch (err) {
        console.error(err);
        resp.status(500).send({ error: 'Internal Server Error' });
    }
});

const start = async()=>{
    try{
        await fastify.listen(PORT)
    }catch(error){
        fastify.log.error(error)
        process.exit(1)
    }
};
start()