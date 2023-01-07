### MQTT Properties (Version 5)

From [2.2.2 Properties](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html#_Toc3901027) of MQTT version 5 specification.

| u8   | type | reason | notes |
|-----:|:-----|:-------|:------|
| 0x01 | u8   | `payload_format_indicator`
| 0x02 | u32  | `message_expiry_interval`
| 0x03 | utf8 | `content_type`
| 0x08 | utf8 | `response_topic`
| 0x09 | bin  | `correlation_data`
| 0x0B | vint | `subscription_identifier`
| 0x11 | u32  | `session_expiry_interval`
| 0x12 | utf8 | `assigned_client_identifier`
| 0x13 | u16  | `server_keep_alive`
| 0x15 | utf8 | `authentication_method`
| 0x16 | bin  | `authentication_data`
| 0x17 | u8   | `request_problem_information`
| 0x18 | u32  | `will_delay_interval`
| 0x19 | u8   | `request_response_information`
| 0x1A | utf8 | `response_information`
| 0x1C | utf8 | `server_reference`
| 0x1F | utf8 | `reason_string`
| 0x21 | u16  | `receive_maximum`
| 0x22 | u16  | `topic_alias_maximum`
| 0x23 | u16  | `topic_alias`
| 0x24 | u8   | `maximum_qos`
| 0x25 | u8   | `retain_available`
| 0x26 | pair | `user_properties` | multiple allowed, returned as object
| 0x27 | u32  | `maximum_packet_size`
| 0x28 | u8   | `wildcard_subscription_available`
| 0x29 | u8   | `subscription_identifiers_available` | multiple allowed, returned as array
| 0x2A | u8   | `shared_subscription_available`


#### Codec

```javascript
// @flow

type mqtt_props_v5 = null | {
  payload_format_indicator?: u8,
  message_expiry_interval?: u32,
  content_type?: utf8,
  response_topic?: utf8,
  correlation_data?: bin,
  subscription_identifier?: vint,
  session_expiry_interval?: u32,
  assigned_client_identifier?: utf8,
  server_keep_alive?: u16,
  authentication_method?: utf8,
  authentication_data?: bin,
  request_problem_information?: u8,
  will_delay_interval?: u32,
  request_response_information?: u8,
  response_information?: utf8,
  server_reference?: utf8,
  reason_string?: utf8,
  receive_maximum?: u16,
  topic_alias_maximum?: u16,
  topic_alias?: u16,
  maximum_qos?: u8,
  retain_available?: u8,
  user_properties?: {[utf8]: utf8}, // another Object of only string keys and values
  maximum_packet_size?: u32,
  wildcard_subscription_available?: u8,
  subscription_identifiers_available?: Array<u8>,
  shared_subscription_available?: u8,
}
```

