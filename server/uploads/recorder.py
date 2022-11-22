import time, cv2, os, ctypes, threading
from threading import Thread
from djitellopy import Tello

videoCount = 0
record = False
frame_read = None

class record(threading.Thread):
    def __init__(self, name):
        threading.Thread.__init__(self)
        self.name = name
        self.stop = False
             
    def run(self):
        try:
            if not os.path.exists(os.path.basename(__file__).replace(".py", "")):
                os.mkdir(os.path.basename(__file__).replace(".py", ""))#maak een mapje met als naam de datestring
                
            while True:

                if record is True:
				
                    print('record true')

                    height, width, _ = frame_read.frame.shape
                    video = cv2.VideoWriter(os.path.basename(__file__).replace(".py", "") + "/" + str(videoCount) + ".avi", cv2.VideoWriter_fourcc(*'XVID'), 30, (width, height))

                    while record:
                        print('record')
                        video.write(frame_read.frame)
                        time.sleep(1 / 30)

                    video.release()
					
                if self.stop:
                    print('stopping')
                    break

                time.sleep(0.1)
        finally:
            print("thread is uit!")
          
    def get_id(self):
 
        # returns id of the respective thread
        if hasattr(self, '_thread_id'):
            return self._thread_id
        for id, thread in threading._active.items():
            if thread is self:
                return id
        
    def raise_exception(self):
        self.stop = True
        thread_id = self.get_id()
        res = ctypes.pythonapi.PyThreadState_SetAsyncExc(thread_id,
              ctypes.py_object(SystemExit))
        if res > 1:
            ctypes.pythonapi.PyThreadState_SetAsyncExc(thread_id, 0)
            print('Exception raise failure')
    

recorder = record('Video opneem thread')
recorder.start()