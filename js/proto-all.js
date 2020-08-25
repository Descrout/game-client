'use strict'; // code generated by pbf v3.2.1

// User ========================================

var User = self.User = {};

User.read = function (pbf, end) {
    return pbf.readFields(User._readField, {id: 0, name: ""}, end);
};
User._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readVarint();
    else if (tag === 2) obj.name = pbf.readString();
};
User.write = function (obj, pbf) {
    if (obj.id) pbf.writeVarintField(1, obj.id);
    if (obj.name) pbf.writeStringField(2, obj.name);
};

// Room ========================================

var Room = self.Room = {};

Room.read = function (pbf, end) {
    return pbf.readFields(Room._readField, {id: 0, name: "", password: false, players: 0}, end);
};
Room._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readVarint();
    else if (tag === 2) obj.name = pbf.readString();
    else if (tag === 3) obj.password = pbf.readBoolean();
    else if (tag === 4) obj.players = pbf.readVarint(true);
};
Room.write = function (obj, pbf) {
    if (obj.id) pbf.writeVarintField(1, obj.id);
    if (obj.name) pbf.writeStringField(2, obj.name);
    if (obj.password) pbf.writeBooleanField(3, obj.password);
    if (obj.players) pbf.writeVarintField(4, obj.players);
};

// Handshake ========================================

var Handshake = self.Handshake = {};

Handshake.read = function (pbf, end) {
    return pbf.readFields(Handshake._readField, {name: ""}, end);
};
Handshake._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.name = pbf.readString();
};
Handshake.write = function (obj, pbf) {
    if (obj.name) pbf.writeStringField(1, obj.name);
};

// Lobby ========================================

var Lobby = self.Lobby = {};

Lobby.read = function (pbf, end) {
    return pbf.readFields(Lobby._readField, {rooms: [], users: [], me: 0}, end);
};
Lobby._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.rooms.push(Room.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 2) obj.users.push(User.read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 3) obj.me = pbf.readVarint();
};
Lobby.write = function (obj, pbf) {
    if (obj.rooms) for (var i = 0; i < obj.rooms.length; i++) pbf.writeMessage(1, Room.write, obj.rooms[i]);
    if (obj.users) for (i = 0; i < obj.users.length; i++) pbf.writeMessage(2, User.write, obj.users[i]);
    if (obj.me) pbf.writeVarintField(3, obj.me);
};

// CreateRoom ========================================

var CreateRoom = self.CreateRoom = {};

CreateRoom.read = function (pbf, end) {
    return pbf.readFields(CreateRoom._readField, {name: "", password: ""}, end);
};
CreateRoom._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.name = pbf.readString();
    else if (tag === 2) obj.password = pbf.readString();
};
CreateRoom.write = function (obj, pbf) {
    if (obj.name) pbf.writeStringField(1, obj.name);
    if (obj.password) pbf.writeStringField(2, obj.password);
};

// JoinRoom ========================================

var JoinRoom = self.JoinRoom = {};

JoinRoom.read = function (pbf, end) {
    return pbf.readFields(JoinRoom._readField, {id: 0, password: ""}, end);
};
JoinRoom._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.id = pbf.readVarint();
    else if (tag === 2) obj.password = pbf.readString();
};
JoinRoom.write = function (obj, pbf) {
    if (obj.id) pbf.writeVarintField(1, obj.id);
    if (obj.password) pbf.writeStringField(2, obj.password);
};

// Chat ========================================

var Chat = self.Chat = {};

Chat.read = function (pbf, end) {
    return pbf.readFields(Chat._readField, {name: "", message: ""}, end);
};
Chat._readField = function (tag, obj, pbf) {
    if (tag === 1) obj.name = pbf.readString();
    else if (tag === 2) obj.message = pbf.readString();
};
Chat.write = function (obj, pbf) {
    if (obj.name) pbf.writeStringField(1, obj.name);
    if (obj.message) pbf.writeStringField(2, obj.message);
};
