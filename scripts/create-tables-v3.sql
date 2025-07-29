-- 기존 테이블이 있다면 삭제 (개발 환경에서만)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- rooms 테이블 먼저 생성
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_started BOOLEAN DEFAULT FALSE,
  loser_id UUID,
  meme_urls TEXT[],
  video_url TEXT -- 영상 URL 컬럼 추가
);

-- users 테이블 생성 (rooms 테이블 생성 후)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id VARCHAR(10) NOT NULL,
  name VARCHAR(50) NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_users_room_id FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
);

-- loser_id 외래키 제약조건 추가
ALTER TABLE rooms ADD CONSTRAINT fk_rooms_loser_id FOREIGN KEY (loser_id) REFERENCES users(id);

-- 인덱스 생성
CREATE INDEX idx_rooms_room_id ON rooms(room_id);
CREATE INDEX idx_users_room_id ON users(room_id);
CREATE INDEX idx_users_is_host ON users(is_host);

-- RLS (Row Level Security) 활성화
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능하도록 정책 설정
CREATE POLICY "Anyone can read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Anyone can read users" ON users FOR SELECT USING (true);

-- 모든 사용자가 삽입 가능하도록 정책 설정
CREATE POLICY "Anyone can insert rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

-- 모든 사용자가 업데이트 가능하도록 정책 설정
CREATE POLICY "Anyone can update rooms" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Anyone can update users" ON users FOR UPDATE USING (true);
