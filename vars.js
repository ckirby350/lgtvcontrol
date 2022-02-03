fileRead = false;
fileWritten = true;
scriptObjs = [];
chunkedTVList = [];
jobList = [];
fileName = "../data/scriptsched.json"

showGuide = false;
currGuideObjs = [];
tvMediaAPIKey = "d96023d3ce3c169c561b049e91598558";
tvMediaLinupNum = "139095";
tvMediaTimezone = "America/Chicago";
tvMediaDateFetchedAttempts = [];

samsungAppId = '721b6fce-4ee6-48ba-8045-955a539edadb';
samsungUserId = '654321';

vizioKeyPressDelayInMillis = 900;
vizioDelayBetweenTVsInMillis = 4000;
lgDelayBetweenTVsInMillis = 2000;

staticChannelList = [
    { 'channelId' : '3_2_2_1_0_0_0', 'channelMode' : 'Cable', 'channelNumber' : '2-1', 'network' : 'WFAA'}
    , { 'channelId' : '3_3_3_1_0_0_0', 'channelMode' : 'Cable', 'channelNumber' : '3-1', 'network' : 'KXAS-TV'}
    , { 'channelId' : '3_47_47_1_0_0_0', 'channelMode' : 'Cable', 'channelNumber' : '47-1', 'network' : 'ESPN'}
    , { 'channelId' : '47-2', 'channelMode' : 'Cable', 'channelNumber' : '47-2', 'network' : 'FS1'}
    , { 'channelId' : '47-3', 'channelMode' : 'Cable', 'channelNumber' : '47-3', 'network' : 'GOLF'}
    , { 'channelId' : '47-4', 'channelMode' : 'Cable', 'channelNumber' : '47-4', 'network' : 'ESPN2'}
    , { 'channelId' : '47-5', 'channelMode' : 'Cable', 'channelNumber' : '47-5', 'network' : 'CHIVE'}
    , { 'channelId' : '3_58_58_1_0_0_0', 'channelMode' : 'Cable', 'channelNumber' : '58-1', 'network' : 'TNT'}
    , { 'channelId' : '58-2', 'channelMode' : 'Cable', 'channelNumber' : '58-2'}
];

tvListObj = [
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "1",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.21",
        'tvNumber' : "2",
        'mfg' : "SONY",
        'key' : "350"
    },
    {
        'ipAddress': "192.168.254.78",
        'tvNumber' : "3",
        'mfg' : "SAMSUNG",
        'key' : "7493"
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "4",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.77",
        'tvNumber' : "5",
        'mfg' : "VIZIO",
        'key' : "Zqcxkfnf6l"
    },
    {
        'ipAddress': "192.168.254.99",
        'tvNumber' : "6",
        'mfg' : "VIZIO",
        'key' : "xxxxxxxxx"
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "7",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "8",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "9",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "10",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "11",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "12",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "13",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "14",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "15",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "16",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "10.10.23.8",
        'tvNumber' : "17",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "18",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "19",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "20",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "21",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "22",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "23",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "24",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "25",
        'mfg' : "LG",
        'key' : ""
    },
    {
        'ipAddress': "192.168.254.23",
        'tvNumber' : "26",
        'mfg' : "LG",
        'key' : ""
    }
];

