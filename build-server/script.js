const {exec} = require('child_process');
const fs = require('fs');
const path = require('path');
const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3')
const mime = require('mime-types');

const s3Client = new S3Client({
    region: 'ap-south-1',
    credentials: {
        accessKeyId: 'AKIA4HWJUDI6CWEMQQ6X',
        secretAccessKey: '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'
    }
})

const PROJECT_ID = process.env.PROJECT_ID;

async function init(){
    console.log('Executing Script...');
    const outDirPath = path.join(__dirname, 'output');
    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data', (data) => {
        console.log(data.toString());
    })
    
    p.stdout.on('error', (error) => {
        console.error('Error:', error);
    })
    p.on('close',async ()=>{
        console.log('Script execution completed.');
        const distFolderPath = path.join(outDirPath, 'output','dist');
        const distFolderContent = fs.readdirSync(distFolderPath,{recursive:true});

        for (const file of distFolderContent){
            const filePath = path.join(distFolderPath, file)
            if (fs.lstatSync(filePath).isDirectory()) continue;

            console.log('Uploading file path:', filePath);
            

            const command = new PutObjectCommand({
                Bucket: 'vercel-but-better',
                Key: `__outputs/${PROJECT_ID}/${file}`,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath) ,
        })

        await s3Client.send(command)
        //https://github.com/Gautam-2604/vercel_test_proj
    }


        
    })


    
}