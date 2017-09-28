#include <DHT.h>

String incomingLine;
String request_id,command,argument;
int stringIndex;
int statuses[12];
String pin_types[12] = {"0","0","0","0","0","0","0","0","0","0","0","0"};
String tmp_array[12] = {"0","0","0","0","0","0","0","0","0","0","0","0"};
DHT dht;

void printStatuses() {
    if (request_id.length()>0) {
      Serial.print(request_id);
      Serial.print(" ");
    }
  Serial.print("STATUS ");
  for (int i=0;i<12;i++) {
    if (pin_types[i] == "relay") {
      Serial.print(statuses[i]);
    } else if (pin_types[i] == "temperature") {
      Serial.print(dht.getTemperature());
      Serial.print("|");
      Serial.print(dht.getHumidity());
    }
    if (i==11) {
      break;
    };
    if (pin_types[i] != "0" && pin_types[i+1] != "0") {
      Serial.print(",");
    };
  }
  Serial.println();
}

void switchRelay(int relayNumber,int mode) {
  if (mode == HIGH) {
    digitalWrite(relayNumber,HIGH);
    statuses[argument.toInt()-1] = 0;
  } else if (mode == LOW) {
    digitalWrite(relayNumber,LOW);
    statuses[argument.toInt()-1] = 1;
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

void split(String str,String delimiter) {
  for (int i=0;i<13;i++) {
    tmp_array[i] = "0";
  }
  int pos = 0;
  int new_pos = 0;
  int counter = 0;
  while (str.indexOf(delimiter,pos)!=-1) {
    new_pos = str.indexOf(delimiter,pos);
    tmp_array[counter] = str.substring(pos,new_pos);
    pos = new_pos+1;
    counter++;
  }
  String last_str = str.substring(pos);
  last_str.trim();
  if (last_str.length()>0) {
    tmp_array[counter] = str.substring(pos);
  }
}

void setPinConfig(String config) {
  String current_pin_def[12];
  split(config,",");
  String pin_config[12] = tmp_array;
  for (int i=0;i<12;i++) {
    pin_config[i].trim();
    if (pin_config[i] != "0" && pin_config[i] != "") {
      split(pin_config[i],"|");
      pin_types[tmp_array[0].toInt()-1] = tmp_array[1];
      if (tmp_array[1] == "temperature") {
        dht.setup(tmp_array[0].toInt());
      }
    }
  }
}

void loop()
{
  delay(dht.getMinimumSamplingPeriod());
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
      } else if (command == "OFF") {
        switchRelay(argument.toInt(),HIGH);
      } else if (command == "CONFIG") {
        Serial.print("SET PIN CONFIG");
        setPinConfig(argument);
      }
    }
    printStatuses();
    request_id="";
}