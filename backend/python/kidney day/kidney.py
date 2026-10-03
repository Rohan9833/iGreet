import shutil
import cv2
import numpy as np
import os
import uuid
from PIL import Image, ImageDraw, ImageFont
import argparse
from moviepy.editor import TextClip
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from multiprocessing import Pool
import gc

# Set a higher limit for image size
Image.MAX_IMAGE_PIXELS = None


# Simple Logging Function
def log_error(message):
    with open("log.txt", "a") as log_file:
        log_file.write(message + "\n")

# Cleanup Function
def clean_up_temp_folder(temp_folder):
    try:
        for root, dirs, files in os.walk(temp_folder, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(temp_folder)
        print(f"Temporary folder {temp_folder} cleaned up.")
    except Exception as e:
        log_error(f"Failed to clean temp folder: {e}")


def process_frames(input_image_path, frames_folder, output_folder,text1,text2,text3,text4):
    try:
        overlay_image = cv2.imread(input_image_path, cv2.IMREAD_COLOR)
        frame_files = sorted(os.listdir(frames_folder), key=lambda x: int(x.split("_")[1].split(".")[0]))
        frame_data = [(frame_file, frames_folder, output_folder, overlay_image, text1, text2, text3, text4) for frame_file in frame_files]
        num_workers = max(1, os.cpu_count() - 1)
        chunk_size = 5

        with Pool(processes=num_workers) as pool:
            results = pool.map(process_frame_worker, frame_data, chunksize=chunk_size)
            failed_frames = [frame for frame in results if frame is None]

        if failed_frames:
            log_error(f"Failed Frames: {len(failed_frames)}")
        else:
            print("All frames processed successfully.")

    except Exception as e:
        log_error(f"Unexpected Error in process_frames: {e}")

    finally:
        gc.collect()
        print("Memory cleanup completed.")

# Frame Processing Worker
def process_frame_worker(frame_data):
    frame_file, frames_folder, output_folder, overlay_image, text1, text2, text3, text4 = frame_data
    try:
        frame_path = os.path.join(frames_folder, frame_file)
        frame = cv2.imread(frame_path)
        if frame is not None:
            processed_frame = replace_contour_with_image(frame, overlay_image, int(frame_file.split("_")[1].split(".")[0]), text1, text2, text3, text4)
            output_path = os.path.join(output_folder, frame_file)
            cv2.imwrite(output_path, processed_frame)
            gc.collect()
        return frame_file
    except Exception as e:
        log_error(f"Frame Processing Failed for {frame_file}: {e}")
        return None


def replace_contour_with_image(frame, overlay_image, frame_number,text1,text2,text3,text4):
    largest_contour = detect_largest_contour(frame)
    if largest_contour is not None:
        x, y, w, h = cv2.boundingRect(largest_contour)
        overlay_resized = cv2.resize(overlay_image, (w, h), interpolation=cv2.INTER_AREA)
        frame[y:y+h, x:x+w] = overlay_resized

    text_lines = [text1,text2,text3,text4]
    font_path = ["Lato-Heavy.ttf", "Lato-Heavy.ttf", "Lato-Heavy.ttf","Lato-Heavy.ttf"]
    font_sizes = [70, 48, 48,48]
    if 19 <= frame_number <= 1415:
        frame = draw_text_on_frame(frame, frame_number, text_lines,font_path,font_sizes)
        
    return frame




def detect_largest_contour(image):
    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

    # Define the purple color range in HSV
    lower_purple = np.array([120, 30, 30])
    upper_purple = np.array([150, 255, 255])

    # Create a mask for purple regions
    mask = cv2.inRange(hsv_image, lower_purple, upper_purple)

    # Find contours
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if contours:
        # Sort contours by area and return the largest one
        largest_contour = max(contours, key=cv2.contourArea)
        return largest_contour
    else:
        return None




def draw_text_on_frame(frame, frame_number, text_lines, font_paths, base_font_sizes):
    text_color = [(0, 0, 0),(29,29,29),(29,29,29),(29,29,29)]  
    line_spacing = [70,55,50,60]
    endline_spacing = [100,60,50,45]

    img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(img_pil)

    progress = 0
    if 19 <= frame_number <= 72 or frame_number >= 1343:
        progress = 0
    elif 73 <= frame_number <= 85:
        progress = np.clip((frame_number - 73) / (85 - 73), 0, 1)
        progress = 0.5 * (1 - np.cos(np.pi * progress)) 
    elif 1327 <= frame_number <= 1342:
        progress = 1 - (frame_number - 1327) / (1342 - 1327)
        progress = 0.5 * (1 - np.cos(np.pi * progress))
    elif 85 < frame_number < 1328:
        progress = 1
        


    x_end = 700 
    start_frame = 33
    end_frame = 55
    frame_interval = max(1, (end_frame - start_frame) // max(1, len(text_lines)))  # Calculate interval per line
    
    # Calculate max width before setting positions
    max_text_width = max([
        ImageDraw.Draw(Image.new("RGB", (1, 1))).textbbox((0, 0), text, font=ImageFont.truetype(font_paths[i], int(base_font_sizes[i] * (1 - 0.3 * progress))), anchor="lt")[2] 
        for i, text in enumerate(text_lines)
    ])

    # Start positions (initially center-aligned)
    start_positions = [(540, 1235 + i * line_spacing[i] - (len(text_lines) * line_spacing[i]) // 2) for i in range(len(text_lines))]

    # End positions (right-aligned)
    end_positions = [
        (x_end - max_text_width, 145 + i * endline_spacing[i])  
        for i in range(len(text_lines))
    ]

    for i, text in enumerate(text_lines):
        # Only draw if the frame number is greater than the assigned appearance frame
        if frame_number < (start_frame + i * frame_interval):
            continue  # Skip this line until its frame appears

        font_size = int(base_font_sizes[i] * (1 - 0.35 * progress))
        font = ImageFont.truetype(font_paths[i], font_size)
        


        x = int(start_positions[i][0] * (1 - progress) + end_positions[i][0] * progress)
        y = int(start_positions[i][1] * (1 - progress) + end_positions[i][1] * progress)
        
        # if frame_number >= 1306:
        #     y = int(start_positions[i][1] * (1 - progress) + end_positions[i][1] * progress) - 150
        
        # Smooth transition for Y after frame 1306
        # Apply smooth transition after frame 1306
        if frame_number >= 1327:
            final_progress = np.clip((frame_number - 1327) / (1342 - 1327), 0, 1)
            final_progress = 0.5 * (1 - np.cos(np.pi * final_progress))  # Smooth easing

            # Transition from end_positions[i][1] to (start_positions[i][1] - 150)
            y = int(end_positions[i][1] * (1 - final_progress) + (start_positions[i][1] - 150) * final_progress)

            
            
        
        bbox = draw.textbbox((0, 0), text, font=font, anchor="lt")
        text_width = bbox[2] - bbox[0]
        tc = text_color[i]

        # Center-right alignment adjustment
        
        center_offset = text_width // 2
        right_offset = max_text_width - text_width

        x = x - int(center_offset * (1 - progress)) + int(right_offset * progress)
        draw.text((x, y), text, font=font, fill=tc)

    return cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)


def create_video_from_frames(output_folder, audio_path, video_output_path):
    try:
        frame_files = sorted(os.listdir(output_folder))
        if not frame_files:
            print("No frames to process.")
            return
 
        os.system(f"ffmpeg -y -framerate 24 -i {output_folder}/frame_%04d.jpg -i {audio_path} -c:v libx264 -pix_fmt yuv420p -c:a aac {video_output_path}")
        print(f"Video created successfully: {video_output_path}")
    except Exception as e:
        log_error(f"Video creation failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    try:
        frames_folder = "frames"
        audio_path = "audio.mp3"
        # Create a temporary folder for storing intermediate frames
        uuid_dir = str(uuid.uuid1())
        temp_folder = f"processed_frames_{uuid_dir}"
        os.makedirs(temp_folder, exist_ok=True)
        
        parser = argparse.ArgumentParser(description="Replace purple region with input image and generate video with audio.")
        parser.add_argument("overlay_image_path", type=str, help="Path to the overlay image")
        parser.add_argument("output_video_path", type=str, help="Path to save the final video")
        parser.add_argument("text1", help="Name")
        parser.add_argument("text2", help="Speciality")
        parser.add_argument("text3", help="Hospital")
        parser.add_argument("text4", help="City")
        args = parser.parse_args()

        process_frames(args.overlay_image_path, frames_folder, temp_folder, args.text1, args.text2, args.text3, args.text4)
        create_video_from_frames(temp_folder, audio_path, args.output_video_path)
        print(f"Video created successfully: {args.output_video_path}")

    except Exception as e:
        log_error(f"Unexpected Error: {e}")
    finally:
        clean_up_temp_folder(temp_folder)
        gc.collect()
        print("Cleanup completed.")