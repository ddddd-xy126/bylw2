-- 数据库：lw_survey

CREATE TABLE IF NOT EXISTS users (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	identifier VARCHAR(128) UNIQUE NOT NULL,
	password_hash VARCHAR(255) NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questionnaires (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	title VARCHAR(255) NOT NULL,
	status ENUM('draft','pending_review','published','archived') NOT NULL DEFAULT 'draft',
	created_by BIGINT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	questionnaire_id BIGINT NOT NULL,
	type ENUM('single','multiple','text','sort','scale') NOT NULL,
	content TEXT NOT NULL,
	options JSON NULL,
	order_index INT NOT NULL DEFAULT 0,
	FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id)
);

CREATE TABLE IF NOT EXISTS question_logic (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	questionnaire_id BIGINT NOT NULL,
	source_question_id BIGINT NOT NULL,
	condition_json JSON NOT NULL,
	target_question_id BIGINT NOT NULL,
	FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id)
);

CREATE TABLE IF NOT EXISTS submissions (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	user_id BIGINT NOT NULL,
	questionnaire_id BIGINT NOT NULL,
	status ENUM('in_progress','submitted') NOT NULL DEFAULT 'submitted',
	score INT DEFAULT 0,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id)
);

CREATE TABLE IF NOT EXISTS answers (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	submission_id BIGINT NOT NULL,
	question_id BIGINT NOT NULL,
	value_json JSON NOT NULL,
	FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

CREATE TABLE IF NOT EXISTS achievements (
	id BIGINT PRIMARY KEY AUTO_INCREMENT,
	code VARCHAR(32) UNIQUE NOT NULL,
	description VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_achievements (
	user_id BIGINT NOT NULL,
	achievement_id BIGINT NOT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(user_id, achievement_id),
	FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);
