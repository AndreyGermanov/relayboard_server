String incomingLine;
String request_id,command,argument;
int stringIndex;
int relayStatuses[12];

void printRelayStatuses() {
  Serial.print(request_id);
  Serial.print(" ");
  Serial.print("STATUS ");
  for (int i=0;i<12;i++) {
    Serial.print(relayStatuses[i]);
    if (i==11) {
      break;
    }
    Serial.print(",");
  }
  Serial.println();
}

void switchRelay(int relayNumber,int mode) {
  if (mode == HIGH) {
    digitalWrite(relayNumber,HIGH);
    relayStatuses[argument.toInt()-1] = 0;
  } else if (mode == LOW) {
    digitalWrite(relayNumber,LOW);
    relayStatuses[argument.toInt()-1] = 1;
  }
}

void setup()
{
  Serial.begin(9600);
  for (int i=1;i<13;i++) {
    pinMode(i,OUTPUT);
    digitalWrite(i,HIGH);
  }
}

void loop()
{
    if (Serial.available()>0) {
      incomingLine = Serial.readString();
      incomingLine.trim();
      stringIndex = incomingLine.indexOf(" ");
      request_id = incomingLine.substring(0,stringIndex);
      if (stringIndex>0) {
        incomingLine = incomingLine.substring(stringIndex+1);
        stringIndex = incomingLine.indexOf(" ");
        command = incomingLine.substring(0,stringIndex);
      };
      if (stringIndex>0) {
        incomingLine = incomingLine.substring(stringIndex+1);
        argument = incomingLine;
      }
      if (command=="ON") {
        switchRelay(argument.toInt(),LOW);
        printRelayStatuses();
      } else if (command == "OFF") {
        switchRelay(argument.toInt(),HIGH);
        printRelayStatuses();
      } else if (command == "STATUS") {
        printRelayStatuses();
      }
    }
}