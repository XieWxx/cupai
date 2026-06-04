-- ============================================
-- CupAI 数据库初始化脚本
-- Docker Compose 启动时自动执行
-- ============================================

-- 设置字符集
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 种子数据：球队（世界杯 32 强示例）
-- ============================================

INSERT INTO teams (id, name, name_en, country_code, fifa_rank, formation, play_style, avg_goals_scored, avg_goals_conceded, avg_possession, win_rate, logo, data_source) VALUES
('team-arg', '阿根廷', 'Argentina', 'ar', 1, '4-3-3', '控球进攻', 2.10, 0.60, 61.50, 78.00, '', 'FIFA'),
('team-fra', '法国', 'France', 'fr', 2, '4-2-3-1', '快速反击', 2.30, 0.80, 55.20, 75.00, '', 'FIFA'),
('team-bra', '巴西', 'Brazil', 'br', 3, '4-3-3', '技术控球', 2.00, 0.70, 60.80, 73.00, '', 'FIFA'),
('team-eng', '英格兰', 'England', 'gb-eng', 4, '4-3-3', '高位压迫', 1.90, 0.50, 58.30, 72.00, '', 'FIFA'),
('team-esp', '西班牙', 'Spain', 'es', 5, '4-3-3', '传控渗透', 1.80, 0.50, 65.20, 70.00, '', 'FIFA'),
('team-ger', '德国', 'Germany', 'de', 6, '4-2-3-1', '整体压迫', 1.70, 0.60, 57.80, 68.00, '', 'FIFA'),
('team-por', '葡萄牙', 'Portugal', 'pt', 7, '4-3-3', '边路突破', 1.80, 0.60, 56.50, 67.00, '', 'FIFA'),
('team-ned', '荷兰', 'Netherlands', 'nl', 8, '3-4-3', '全攻全守', 1.90, 0.70, 58.00, 66.00, '', 'FIFA'),
('team-ita', '意大利', 'Italy', 'it', 9, '3-5-2', '防守反击', 1.40, 0.40, 52.30, 65.00, '', 'FIFA'),
('team-cro', '克罗地亚', 'Croatia', 'hr', 10, '4-3-3', '中场控制', 1.50, 0.50, 55.00, 63.00, '', 'FIFA'),
('team-bel', '比利时', 'Belgium', 'be', 11, '3-4-3', '快速推进', 1.70, 0.70, 54.80, 62.00, '', 'FIFA'),
('team-uru', '乌拉圭', 'Uruguay', 'uy', 12, '4-4-2', '硬朗对抗', 1.40, 0.60, 49.50, 60.00, '', 'FIFA'),
('team-jpn', '日本', 'Japan', 'jp', 18, '4-2-3-1', '团队配合', 1.30, 0.80, 52.00, 55.00, '', 'FIFA'),
('team-kor', '韩国', 'South Korea', 'kr', 23, '4-4-2', '高位逼抢', 1.20, 0.90, 48.50, 50.00, '', 'FIFA'),
('team-mex', '墨西哥', 'Mexico', 'mx', 15, '4-3-3', '快速传递', 1.50, 0.80, 53.00, 56.00, '', 'FIFA'),
('team-usa', '美国', 'USA', 'us', 13, '4-3-3', '身体对抗', 1.40, 0.70, 50.50, 57.00, '', 'FIFA');

-- ============================================
-- 种子数据：球星（核心球员示例）
-- ============================================

INSERT INTO players (id, name, name_en, team_id, position, age, is_key_player, season_goals, season_assists, injury_status, yellow_cards, red_cards, avatar, data_source) VALUES
('player-messi', '梅西', 'Lionel Messi', 'team-arg', 'RW', 37, true, 15, 12, '健康', 2, 0, '', 'FIFA'),
('player-mbappe', '姆巴佩', 'Kylian Mbappé', 'team-fra', 'ST', 25, true, 22, 8, '健康', 3, 0, '', 'FIFA'),
('player-vinicius', '维尼修斯', 'Vinícius Júnior', 'team-bra', 'LW', 24, true, 18, 10, '健康', 4, 0, '', 'FIFA'),
('player-bellingham', '贝林厄姆', 'Jude Bellingham', 'team-eng', 'CM', 21, true, 14, 9, '健康', 3, 0, '', 'FIFA'),
('player-rodrigo', '罗德里', 'Rodri', 'team-esp', 'CDM', 28, true, 6, 8, '健康', 5, 0, '', 'FIFA'),
('player-wirtz', '维尔茨', 'Florian Wirtz', 'team-ger', 'AM', 21, true, 12, 7, '健康', 2, 0, '', 'FIFA'),
('player-leao', '莱奥', 'Rafael Leão', 'team-por', 'LW', 25, true, 10, 8, '轻伤', 3, 0, '', 'FIFA'),
('player-simons', '西蒙斯', 'Xavi Simons', 'team-ned', 'AM', 21, true, 11, 9, '健康', 2, 0, '', 'FIFA'),
('player-kubo', '久保建英', 'Takefusa Kubo', 'team-jpn', 'RW', 23, true, 8, 5, '健康', 1, 0, '', 'FIFA'),
('player-son', '孙兴慜', 'Son Heung-min', 'team-kor', 'LW', 32, true, 12, 6, '健康', 2, 0, '', 'FIFA');

-- ============================================
-- 种子数据：赛事（小组赛示例）
-- ============================================

INSERT INTO matches (id, league_name, stage, home_team_id, away_team_id, start_time, status, venue, referee_name, temperature, humidity, weather_condition, wind_speed, data_source) VALUES
('match-001', 'FIFA World Cup 2026', '小组赛A组', 'team-arg', 'team-mex', '2026-06-12 03:00:00', 'upcoming', 'SoFi Stadium', '裁判A', 24.0, 45.0, '晴', 8.0, 'FIFA'),
('match-002', 'FIFA World Cup 2026', '小组赛A组', 'team-fra', 'team-jpn', '2026-06-12 21:00:00', 'upcoming', 'MetLife Stadium', '裁判B', 22.0, 50.0, '多云', 12.0, 'FIFA'),
('match-003', 'FIFA World Cup 2026', '小组赛B组', 'team-eng', 'team-kor', '2026-06-13 03:00:00', 'upcoming', 'Lumen Field', '裁判C', 18.0, 55.0, '小雨', 15.0, 'FIFA'),
('match-004', 'FIFA World Cup 2026', '小组赛B组', 'team-bra', 'team-usa', '2026-06-13 21:00:00', 'upcoming', 'Gillette Stadium', '裁判D', 20.0, 48.0, '晴', 6.0, 'FIFA'),
('match-005', 'FIFA World Cup 2026', '小组赛C组', 'team-esp', 'team-uru', '2026-06-14 03:00:00', 'upcoming', 'Hard Rock Stadium', '裁判E', 28.0, 60.0, '晴', 5.0, 'FIFA'),
('match-006', 'FIFA World Cup 2026', '小组赛C组', 'team-ger', 'team-cro', '2026-06-14 21:00:00', 'upcoming', 'AT&T Stadium', '裁判F', 26.0, 42.0, '晴', 7.0, 'FIFA'),
('match-007', 'FIFA World Cup 2026', '小组赛D组', 'team-por', 'team-ned', '2026-06-15 03:00:00', 'upcoming', 'Mercedes-Benz Stadium', '裁判G', 25.0, 52.0, '多云', 10.0, 'FIFA'),
('match-008', 'FIFA World Cup 2026', '小组赛D组', 'team-ita', 'team-bel', '2026-06-15 21:00:00', 'upcoming', 'Lincoln Financial Field', '裁判H', 23.0, 47.0, '晴', 9.0, 'FIFA');

-- ============================================
-- 种子数据：默认 Prompt 模板（平台内置）
-- ============================================

INSERT INTO prompt_templates (id, user_id, name, scene, content, adapted_model, adapted_stage, is_public, collect_count, use_count, like_count, is_original) VALUES
('prompt-default-preview', 'system', '赛事前瞻分析', 'match_preview', '你是一位专业的世界杯赛事分析师。请根据以下数据和权重配置，对即将进行的比赛进行全面前瞻分析。

## 权重配置
{{weights}}

## 赛事数据
{{matchData}}

## 分析要求
1. 根据权重配置，重点分析权重较高的因子
2. 结合历史交锋记录和近期状态
3. 分析双方战术风格和克制关系
4. 评估环境因素（天气、场地、裁判）的影响
5. 给出综合分析结论和关键看点

分析时间: {{timestamp}}', NULL, NULL, true, 0, 0, 0, true),

('prompt-default-compare', 'system', '球队实力对比', 'team_compare', '你是一位专业的世界杯赛事分析师。请对以下两支球队进行全方位实力对比分析。

## 权重配置
{{weights}}

## 赛事数据
{{matchData}}

## 对比分析要求
1. 历史战绩对比（交锋记录、大赛经验）
2. 球队实力对比（FIFA排名、阵容深度、攻防数据）
3. 核心球星状态对比
4. 战术风格对比与克制关系
5. 综合评估双方优劣势

分析时间: {{timestamp}}', NULL, NULL, true, 0, 0, 0, true),

('prompt-default-player', 'system', '球星状态分析', 'player_analysis', '你是一位专业的世界杯赛事分析师。请对以下赛事中核心球星的状态进行深入分析。

## 权重配置
{{weights}}

## 赛事数据
{{matchData}}

## 分析要求
1. 核心球星近期状态评估（进球、助攻、伤病）
2. 球星在国家队 vs 俱乐部表现差异
3. 球星对比赛走势的关键影响
4. 对位球员对比分析
5. 球星心理状态和压力评估

分析时间: {{timestamp}}', NULL, NULL, true, 0, 0, 0, true),

('prompt-default-qualify', 'system', '出线形势推演', 'qualification_predict', '你是一位专业的世界杯赛事分析师。请根据以下数据和权重配置，推演小组出线形势。

## 权重配置
{{weights}}

## 赛事数据
{{matchData}}

## 推演要求
1. 当前小组积分形势分析
2. 各队剩余赛程难度评估
3. 关键比赛结果对出线的影响
4. 各种出线情景概率推演
5. 最可能出线球队及理由

分析时间: {{timestamp}}', NULL, NULL, true, 0, 0, 0, true),

('prompt-default-sentiment', 'system', '舆情情绪研判', 'sentiment_analysis', '你是一位专业的世界杯赛事分析师。请根据以下数据和权重配置，研判赛事相关的社交舆情和情绪走势。

## 权重配置
{{weights}}

## 赛事数据
{{matchData}}

## 研判要求
1. 双方球迷情绪走势分析
2. 媒体舆论倾向评估
3. 社交平台热度对比
4. 舆论压力对球队表现的可能影响
5. 关键舆情事件解读

分析时间: {{timestamp}}', NULL, NULL, true, 0, 0, 0, true);
