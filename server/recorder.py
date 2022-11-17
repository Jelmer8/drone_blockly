import time, cv2
from threading import Thread
from djitellopy import Tello

videoCount = 0
record = False
frame_read = None

def video_opnemen():# let op! dit is een functie die nodig is voor het opnemen van video
	try:
		os.mkdir(os.path.basename(__file__).replace(".py", ""))#maak een mapje met als naam de datestring
		while True:

			if record is True:

				height, width, _ = frame_read.frame.shape
				video = cv2.VideoWriter(os.path.basename(__file__).replace(".py", "") + "/" + videoCount + ".avi", cv2.VideoWriter_fourcc(*'XVID'), 30, (width, height))

				while record:
					video.write(frame_read.frame)
					time.sleep(1 / 30)

				video.release()

			time.sleep(0.1)
	finally:
		print("thread is uit!")

recorder = Thread(target=video_opnemen)
recorder.start()