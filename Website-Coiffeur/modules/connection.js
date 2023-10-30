import { MongoClient } from 'mongodb';

const mongoClient = new MongoClient("mongodb+srv://FreshCut:OqeJ8NkcWMK00WKM@freshcut.gmjnqb0.mongodb.net/?retryWrites=true&w=majority");

export async function connectToMongo(){
    return await mongoClient.connect();
}

export async function getCollection(name){
    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")

    return BD.collection(name)
}
export default connectToMongo;