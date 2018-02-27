#!usr/bin/python

#Measuring temperature
def gettemp(id):
    try:
        mytemp = ''
        filename = 'w1_slave'
        f = open('/sys/bus/w1/devices/' + id + '/' + filename, 'r')
        line = f.readline() # read 1st line
        crc = line.rsplit(' ',1)
        crc = crc[1].replace('\n', '')
        if crc=='YES':
            line = f.readline() # read 2nd line
            mytemp = line.rsplit('t=',1)
        else:
            mytemp = 99999
        f.close()
        return int(mytemp[1])
    except:
        return 99999

if __name__ == '__main__':
    # Script has been called directly
    id = '10-000801a96106'
    mt = gettemp(id)/float(1000)    #Momentantemperatur
    print "Momentantemperatur : " + '{:.3f}'.format(mt)


def rpm():

    return

# Lüftersteuerung
def fanCon(mt):
    st = 35.0           #Solltemperatur in Grad Celsius
    maxspeed = 3800     #Maximale Geschwindigkeit des Lüfters in RPM
    if mt > st:

        rpm = ''

"""

def pwm():

    import RPi.GPIO as GPIO
    from time import sleep

    PWMpin = 33				# PWM pin zum Anschluss des Lüfters (PWM1 33,35)
    GPIO.setwarnings(False)			#disable warnings
    GPIO.setmode(GPIO.BOARD)		#set pin numbering system
    GPIO.setup(PWMpin,GPIO.OUT)
    fan_pwm = GPIO.PWM(PWMpin,100)		#create PWM instance with frequency
    fan_pwm.start(0)				#start PWM of required Duty Cycle
    while True:
        for duty in range(0,101,1):
            fan_pwm.ChangeDutyCycle(duty) #provide duty cycle in the range 0-100
            sleep(0.01)
        sleep(0.5)

        for duty in range(100,-1,-1):
            fan_pwm.ChangeDutyCycle(duty)
            sleep(0.01)
        sleep(0.5)


    return
"""





