import fileSchema from '../models/File.js'
import { pdfFiles } from '../config/dbConnect.js'
import mongoose from 'mongoose';

class FileController {

    static async getFiles(req, res) {
        try {
            const files = await pdfFiles.find({}).toArray()
            if (!files || files.length === 0) {
                return res.status(200).json({ msg: "No files found" });
            }
            res.status(200).json(files);
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
        }
    }

    static async getFile(req, res) {
        const { id } = req.params
        try {
            const fileFound = await pdfFiles.find({ _id: new mongoose.Types.ObjectId(id) }).toArray()
            res.status(200).json(fileFound)
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async uploadFile(req, res) {

        const { fileName, marker, userId } = req.body  
        console.log(req.body);
              
        
        if (!fileName) {
            return res.status(400).send('Name is required')
        }

        const textFile = req.file
        if (!textFile) {
            return res.status(400).send('File is required')
        }

        try {
            const uploadStream = pdfFiles.openUploadStream(fileName, {
                contentType: textFile.mimetype,
                metadata: { 
                marker: marker,
                userId: userId
                }
            })

            uploadStream.end(textFile.buffer)
            uploadStream.on('finish', () => {
                res.status(200).send('File uploaded successfully')
            })

            uploadStream.on('error', (error) => {
                res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
            })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }

    }

    static async downloadFile(req, res) {
        const { id } = req.params
        try {
            const fileFound = await pdfFiles.find({ id: new mongoose.Types.ObjectId(id) }).toArray()
            if (!fileFound) {
                return res.status(404).send('File not found')
            }
            const downloadStream = pdfFiles.openDownloadStream(fileFound._id)
            downloadStream.pipe(res)
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async deleteFile(req, res) {
        const { id } = req.params
        try {
            await fileSchema.deleteOne({ id: id })
            res.status(200).send('File deleted successfully')
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async showFile(req, res) {
        const { id } = req.params;

        try {
            // Valida o formato do ID
            if (!id.match(/^[a-fA-F0-9]{24}$/)) {
                return res.status(400).json({ error: "Invalid file ID format." });
            }

            // Verifica se o arquivo existe
            const fileCursor = pdfFiles.find({ _id: new mongoose.Types.ObjectId(id) });
            const fileFound = await fileCursor.toArray();

            if (fileFound.length === 0) {
                return res.status(404).json({ error: "File not found." });
            }

            // Cria o stream de download do arquivo
            const downloadStream = pdfFiles.openDownloadStream(new mongoose.Types.ObjectId(id));

            // Configura o cabeçalho para PDF
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename="${fileFound[0].filename}"`);

            // Faz o pipe do stream para a resposta
            downloadStream.on("error", (error) => {
                console.error("Error while reading the file:", error.message);
                res.status(500).json({ error: "Error while reading the file." });
            });

            downloadStream.pipe(res);
        } catch (error) {
            console.error("Error in showFile:", error.message);
            res.status(500).json({ error: "Server error.", details: error.message });
        }
    }


}

export default FileController
