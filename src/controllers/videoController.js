import { videoFiles } from '../config/dbConnect.js'
import mongoose from 'mongoose';

class VideoController {
    
    static async getVideos(req, res) {
        try {
            const videos = await videoFiles.find({}).toArray()
            if (!videos || videos.length === 0) {
                return res.status(200).json({ msg: "No videos found" });
            }
            res.status(200).json(videos);
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
        }
    }

    static async getVideo(req, res) {
        const { id } = req.params
        try {
            const videoFound = await videoFiles.find({ _id: new mongoose.Types.ObjectId(id) }).toArray()
            res.status(200).json(videoFound)
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async uploadVideo(req, res) {

        const { videoName, description, marker, userId } = req.body  
        console.log(req.body);
              
        if (!videoName) {
            return res.status(400).send('Name is required')
        }

        const videoFile = req.file
        if (!videoFile) {
            return res.status(400).send('File is required')
        }

        try {
            const uploadStream = videoFiles.openUploadStream(videoName, {
                contentType: videoFile.mimetype,
                metadata: { 
                description: description,
                marker: marker,
                userId: userId
                }
            })

            let uploadedBytes = 0
            const totalBytes = videoFile.size

            uploadStream.on('data', (chunk) => {
                uploadedBytes += chunk.length
                const progress = (uploadedBytes / totalBytes) * 100
                res.write(`data: ${progress.toFixed(2)}%\n\n`)
            })

            uploadStream.end(videoFile.buffer)
            uploadStream.on('finish', () => {
                res.status(200).send('File uploaded successfully')
            })            

            uploadStream.on('error', (error) => {
                res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
            })
        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
        }
    }

    static async donwloadVideo(req, res) {
        const { id } = req.params
        try {
            console.log('Starting downloading video', id); // log
            
            const videoFound = await videoFiles.find({ _id: new mongoose.Types.ObjectId(id) }).toArray()
            if (!videoFound || videoFound.length === 0) {
                return res.status(404).send('Video not found')
            }
            const video = videoFound[0]
            const downloadStream = videoFiles.openDownloadStream(video._id)
            res.set('Content-Type', video.contentType || 'video/mp4')
            res.set({
                'Content-Disposition': `attachment; filename="${video.filename}"`,
                'Content-Length': video.length,
                'Content-Type': video.contentType || 'video/mp4',
                'Description': video.metadata.description || '',
                'Marker': video.metadata.marker || '',
                'UserId': video.metadata.userId || ''
            })
            console.log('No fim do try' , video); // log

            let downloadedBytes = 0
            const totalBytes = video.length

            downloadStream.on('data', (chunk) => {
                downloadedBytes += chunk.length
                const progress = (downloadedBytes / totalBytes) * 100
                res.write(`data: ${progress.toFixed(2)}%\n\n`)
            })

            downloadStream.on('error', (error) => {
                console.error(`Error in download stream: ${error.message}`);
                res.status(500).json({ msg: "Something went wrong in the server", error: error.message });
            });
            
            downloadStream.pipe(res)
        } catch (error) {
            console.error(`Error downloading video: ${error.message}`);
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }

    static async deleteVideo(req, res) {
        const { id } = req.params
        try {
            const videoFound = await videoFiles.find({ _id: new mongoose.Types.ObjectId(id) }).toArray()
            if (!videoFound || videoFound.length === 0) {
                return res.status(404).send('Video not found')
            }

            const video = videoFound[0]
            await videoFiles.delete(video._id)
            res.status(200).send('Video deleted successfully')

        } catch (error) {
            res.status(500).json({ msg: "Something went wrong in the server", error: error.message })
        }
    }
}

export default VideoController