import mongoose from 'mongoose';


const uri =`mongodb+srv://renanbuiatti14:vPJPwaZG3MYM@cluster0.eqwke.mongodb.net/`


async function testconnection() {
    try {
        // Attempt to connect to MongoDB
        await mongoose.connect(uri);
        console.log('Test Connection: Successfully connected to MongoDB');
    } catch (error) {
        console.error('Test Connection Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
    }
}

testconnection();