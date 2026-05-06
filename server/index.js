
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');

const app = express();
const port = 3001;

// Multer 설정: 파일을 메모리에 저장
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('서버가 성공적으로 실행되었습니다!');
});

// 파일 업로드 API 엔드포인트
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('파일이 업로드되지 않았습니다.');
  }

  try {
    // 메모리에 저장된 파일 버퍼를 이용해 XLSX 파싱
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // 여기서 데이터베이스에 저장하는 로직이 추가될 수 있습니다.
    // 지금은 파싱된 데이터를 클라이언트에 다시 보내줍니다.
    res.json(jsonData);
  }
  catch (error) {
    console.error('파일 처리 중 오류 발생:', error);
    res.status(500).send('파일을 처리하는 동안 오류가 발생했습니다.');
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
