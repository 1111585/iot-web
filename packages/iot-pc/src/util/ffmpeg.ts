import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

/**
 * wasm FFmpeg 媒体操作
 * 
 * 现有方法
 * - captureFrame : 从视频流中截取一帧
 * - captureFrameToDataURL : 从视频流中截取一帧并返回 Data URL
 * - downloadFrame : 从视频流中截取一帧并下载
 * - extractVideoSegment : 从视频流中提取视频片段
 * - downloadVideoSegment : 从视频流中提取视频片段并下载
 */


const ffmpeg = new FFmpeg();
let loaded = false;

/**
 * 加载 FFmpeg 核心库
 */
async function loadFFmpeg(): Promise<void> {
  if (loaded) return;
  
  try {
    console.time('[FFmpeg] 拼尽全力开始加载...');

    ffmpeg.on('log', ({ message: msg }) => {
      console.log('[FFmpeg]', msg);
    });
    
    const baseURL = '/ffmpeg';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    loaded = true;
    console.timeEnd('[FFmpeg] 拼尽全力开始加载...');
  } catch (error) {
    console.error('[FFmpeg] 拼尽全力也无法加载:', error);
    loaded = false; // 重置状态，允许下次重试
    throw error;
  }
}

export interface FrameCaptureOptions {
  /** 图片质量 (1-100)，默认为 90 */
  quality?: number;
  /** 输出格式，默认为 'jpg' */
  format?: 'jpg' | 'png';
  /** 输出图片宽度，默认保持原始尺寸 */
  width?: number;
  /** 输出图片高度，默认保持原始尺寸 */
  height?: number;
}

/**
 * 从视频流中截取一帧
 * @param videoUrl 视频流或直播流的URL
 * @param timeInSeconds 要截取的时间点（秒）
 * @param options 其他选项
 * @returns 返回截取的帧作为 Blob 对象
 */
export async function captureFrame(
  videoUrl: string,
  timeInSeconds: number = 0,
  options: FrameCaptureOptions = {}
): Promise<Blob> {
  
  const { quality = 90, format = 'jpg', width, height } = options;

  // 输入和输出文件名
  const inputFileName = 'input_stream';
  const outputFileName = `output.${format}`;

  // 初始化 FFmpeg
  await loadFFmpeg();

  try {
    // 将视频流加载到 FFmpeg 的虚拟文件系统中
    console.log('[FFmpeg] 请求视频流...', videoUrl);
    const fileData = await fetchFile(videoUrl);
    await ffmpeg.writeFile(inputFileName, fileData);

    // 构建 FFmpeg 命令参数
    const ffmpegArgs = [
      '-i', inputFileName,          // 输入文件
      '-ss', timeInSeconds.toString(), // 时间点（秒）
      '-frames:v', '1',              // 只截取一帧
      '-q:v', (Math.floor(100 - quality) / 10).toString(), // 质量转换为 FFmpeg 的 q 值 (0-10)
    ];

    // 添加尺寸参数（如果指定）
    if (width && height) {
      ffmpegArgs.push('-s', `${width}x${height}`);
    }

    // 添加输出文件名
    ffmpegArgs.push(outputFileName);

    // 执行 FFmpeg 命令
    console.log('[FFmpeg] 执行FFmpeg命令...', ffmpegArgs);
    await ffmpeg.exec(ffmpegArgs);

    // 读取生成的图片文件
    const data = await ffmpeg.readFile(outputFileName);
    console.log('[FFmpeg] 截取成功');

    // 清理文件系统
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    // 确定正确的 MIME 类型
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    
    // 将文件转换为 Blob
    return new Blob([data], { type: mimeType });
  } catch (error) {
    console.error('[FFmpeg] 截取失败:', error);
    throw error;
  }
}

/**
 * 从视频流中截取一帧并返回 Data URL
 * @param videoUrl 视频流的URL
 * @param timeInSeconds 要截取的时间点（秒）
 * @param options 其他选项
 * @returns 返回截取的帧作为 Data URL
 */
export async function captureFrameToDataURL(
  videoUrl: string,
  timeInSeconds: number = 0,
  options: FrameCaptureOptions = {}
): Promise<string> {
  const blob = await captureFrame(videoUrl, timeInSeconds, options);
  return URL.createObjectURL(blob);
}

export interface FrameDownloadOptions extends FrameCaptureOptions {
  /** 下载的文件名，默认为 'captured_frame.jpg' */
  fileName?: string;
}

/**
 * 从视频流中截取一帧并下载
 * @param videoUrl 视频流的URL
 * @param timeInSeconds 要截取的时间点（秒）
 * @param options 其他选项
 */
export async function downloadFrame(
  videoUrl: string,
  timeInSeconds: number = 0,
  options: FrameDownloadOptions = {}
): Promise<void> {
  const { fileName = 'captured_frame.jpg', ...captureOptions } = options;
  const format = captureOptions.format || 'jpg';
  
  // 确保文件名有正确的扩展名
  let finalFileName = fileName;
  if (!finalFileName.endsWith(`.${format}`)) {
    finalFileName = `${finalFileName.split('.')[0]}.${format}`;
  }

  const blob = await captureFrame(videoUrl, timeInSeconds, captureOptions);
  const url = URL.createObjectURL(blob);
  
  // 创建下载链接
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFileName;
  a.click();
  
  // 清理
  URL.revokeObjectURL(url);
}

/**
 * 从视频流中提取视频片段的选项
 */
export interface VideoSegmentOptions {
  /** 输出文件名，默认为 'output.mp4' */
  outputFileName?: string;
}

/**
 * 从视频流中提取视频片段
 * @param videoUrl 视频流的URL
 * @param startTime 起始时间（秒）
 * @param duration 持续时间（秒）
 * @param options 提取选项
 * @returns 返回提取的视频片段作为 Blob 对象
 */
export async function extractVideoSegment(
  videoUrl: string,
  startTime: number,
  duration: number,
  options: VideoSegmentOptions = {}
): Promise<Blob> {
  // 初始化 FFmpeg
  await loadFFmpeg();

  const inputFileName = 'input_stream';
  const { outputFileName = 'output.mp4' } = options;

  try {
    // 将远程视频流加载到 FFmpeg 的虚拟文件系统中
    console.log('[FFmpeg] 请求视频流...');
    const fileData = await fetchFile(videoUrl);
    await ffmpeg.writeFile(inputFileName, fileData);

    // 执行 FFmpeg 命令来截取视频片段
    console.log('[FFmpeg] 执行FFmpeg命令...');
    await ffmpeg.exec([
      '-i', inputFileName,         // 输入文件
      '-ss', startTime.toString(),  // 起始时间（秒）
      '-t', duration.toString(),    // 持续时间（秒）
      '-c', 'copy',                 // 直接复制流（不重新编码）
      outputFileName                // 输出文件名
    ]);

    // 读取生成的视频文件
    const data = await ffmpeg.readFile(outputFileName);
    
    // 清理文件系统
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);

    // 将文件转换为 Blob
    return new Blob([data], { type: 'video/mp4' });
  } catch (error) {
    console.error('[FFmpeg] 提取视频片段失败:', error);
    throw error;
  }
}

/**
 * 从视频流中提取视频片段并下载
 * @param videoUrl 视频流的URL
 * @param startTime 起始时间（秒）
 * @param duration 持续时间（秒）
 * @param options 提取选项
 */
export async function downloadVideoSegment(
  videoUrl: string,
  startTime: number,
  duration: number,
  options: VideoSegmentOptions = {}
): Promise<void> {
  const blob = await extractVideoSegment(videoUrl, startTime, duration, options);
  const url = URL.createObjectURL(blob);
  
  // 创建下载链接
  const a = document.createElement('a');
  a.href = url;
  a.download = options.outputFileName || 'output.mp4';
  a.click();
  
  // 清理
  URL.revokeObjectURL(url);
}