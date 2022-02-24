const { shell } = require('electron');
const util = require('util');
const exec = util.promisify(require('child_process').exec)
const fs = require('fs');

module.exports.startRender = async function (arg, event, win) {
    // event.preventDefault() // stop the form from submitting

    // start render
    // let args = []
    let args = []

    let fileSelect = arg.fileSelect
    let fileName = arg.fileSelect_name
    
    args.push('-i', `${fileSelect.split(/ +/).join('\\ ')}`);
    // If encoder is CPU use libx264, Nvidia GPU use nvenc, Intel GPU use qsv, AMD GPU use amd
    if (arg.encoder === 'CPU') {
        args.push('-c:v', 'libx264');
    } else if (arg.encoder === 'Nvidia') {
        args.push('-c:v', 'h264_nvenc');
    } else if (arg.encoder === 'Intel') {
        args.push('-c:v', 'h264_qsv');
    } else if (arg.encoder === 'AMD') {
        args.push('-c:v', 'h264_amf');
    }
    // Resolution and remove "p" from the end of the string
    args.push('-vf', `scale=-1:${arg.resolution.split(/ +/).join('')}`);
    args.push('-b:a', '128k');
    args.push('-q', '28');
    args.push('-rc-lookahead', '13');
    // Preset from data
    args.push('-preset', arg.preset);
    // Audio format from data
    args.push('-c:a', arg.audio);
    // Lowercase pixel format from data and push
    args.push('-pix_fmt', arg.pixel.toLowerCase());


    // add K after last number for bitrate
    let bitrate = arg.bitrate + 'K';
    args.push('-b:v', bitrate);
    // Force 60fps
    args.push('-r', '60');
    // Replace video if exists
    // Output file with name of input file ended with _60fps.mp4
    let output
    // Output to Videos folder from Users folder
    output = `${process.env.USERPROFILE}\\Videos\\`


    
    args.push(output + fileName.split(/ +/).join('\\ ') + '_60fps.mp4');
    args.push('-y');
    let currentTime = process.hrtime()
    console.log(args.join(' '));
    let ffmpegProcess
    ffmpegProcess = await exec('ffmpeg ' + args.join(' '), (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
        }
        console.log(`stdout: \n${stdout}`);
        // Finish render
        let eplasedTime = process.hrtime(currentTime)
        win.webContents.send('render-finish', (output, eplasedTime));
        // Open folder with the video selected
        shell.openPath(output);
        // Flash the app 
        win.flashFrame(true);
    });

}
