---
title: mpvacious：边看视频边做 Anki 卡
description: Ajatt-Tools 出品的 mpv 插件——看剧遇到生词句，几秒内把句子、音频、截图送进 Anki，句子挖掘的完全体。
---

[mpvacious](https://github.com/Ajatt-Tools/mpvacious) 是 [Ajatt-Tools](https://ajatt-tools.github.io) 社区为 mpv 编写的用户脚本（Lua 插件），专门服务沉浸式学习的挖句环节：

> 看到生词句 → 定位字幕 → 按一个键 → Anki 里出现一张带**句子 + 音频 + 截图**的卡片。

不用暂停太久、不用手动截图录音频、不用切换窗口。整个动作三五秒完成，沉浸节奏几乎不被打断。

## 工作原理

mpvacious 运行在 mpv 内部，制卡时的数据流：

1. 从当前字幕轨读取选中的字幕行（文本 + 起止时间）；
2. 按时间区间切割出**音频片段**和**视频截图**（用 mpv 内置编码器或 ffmpeg）；
3. 通过 HTTP 调用本机 8765 端口的 **AnkiConnect**，把媒体和文本写进 Anki 笔记。

因此它对「字幕」有依赖：字幕存在且时间轴大体准确，体验就顺滑。

## 前置条件

| 依赖 | 说明 |
| ---- | ---- |
| mpv | 官方要求 **v0.41.0 或更新**（见[上一篇](/guides/mpv/#安装)安装） |
| Anki | 桌面版，制卡时保持运行 |
| AnkiConnect | Anki 插件，代码 2055492159（见 [Anki 篇](/guides/anki-srs/#ankiconnect)） |
| curl | Windows 7 之外的系统一般自带 |
| 剪贴板工具（可选） | Linux 需 `xclip` 或 `wl-copy`，macOS 自带 `pbcopy`，用于复制字幕文本 |
| ffmpeg（强烈推荐） | 绝大多数「音频/截图没进卡片」的问题都能靠它解决 |

检查你的 mpv 是否支持内置编码（不支持也无妨，装 ffmpeg 后开 `use_ffmpeg=yes` 即可）：

```sh
mpv test_video.mkv --loop-file=no --frames=1 -o=test_image.jpg
```

## 安装

### Linux / macOS（推荐）

一键脚本：

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Ajatt-Tools/mpvacious/HEAD/scripts/install.sh)"
```

或 git 方式（便于 `git pull` 更新）：

```sh
mkdir -p ~/.config/mpv/scripts/
git clone https://github.com/Ajatt-Tools/mpvacious.git ~/.config/mpv/scripts/mpvacious
```

### Windows

PowerShell 一键脚本：

```powershell
irm https://raw.githubusercontent.com/Ajatt-Tools/mpvacious/HEAD/scripts/install.ps1 | iex
```

> [!NOTE]
> 若首次运行远程脚本报错，先执行 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`。使用 mpv 便携版（`portable_config` 目录）时，脚本会自动装进便携目录。

手动安装：从 [Releases](https://github.com/Ajatt-Tools/mpvacious/releases) 下载并解压 `mpvacious` 文件夹到 mpv 的 scripts 目录：

| 系统 | scripts 目录 |
| ---- | ---- |
| Linux / macOS | `~/.config/mpv/scripts/` |
| Windows | `C:/Users/用户名/AppData/Roaming/mpv/scripts/` |

Arch 用户也可以直接装 AUR 包 `mpv-mpvacious`。

安装成功的标志：播放任意视频时按 `a`，屏幕出现 mpvacious 菜单。

## 首次配置

配置文件路径（不存在则新建）：

| 系统 | 位置 |
| ---- | ---- |
| Linux / macOS | `~/.config/mpv/script-opts/subs2srs.conf` |
| Windows | `C:/Users/用户名/AppData/Roaming/mpv/script-opts/subs2srs.conf` |

一个英语挖句的最小配置（配合 [Anki 篇](/guides/anki-srs/#建一个挖句用的笔记类型)建的笔记类型）：

```ini
deck_name=English Sentence Mining
model_name=Sentence Card
sentence_field=Sentence
audio_field=Audio
image_field=Image
```

几个要点：

- **字段名必须与笔记类型完全一致**（区分大小写），写错只会得到空字段；
- **句子字段应放在笔记类型的第一个字段**。否则制卡时第一字段为空，mpvacious 会填入 `[empty]` 占位（Anki 不允许首字段为空）；
- 懒得自建结构就直接用[官方笔记类型](https://ankiweb.net/shared/info/1557722832)（AnkiWeb #1557722832），字段名照抄即可；
- 经验之谈：`use_ffmpeg=yes` 几乎总值得开启（前提是装了 ffmpeg）。

完整可配置项见仓库内的 `mpvacious/config/default_config.conf`。

## 核心操作与键位

以下均为默认键位（大写字母表示需要按 Shift，如 `Ctrl+M` 实际是 `Ctrl+Shift+m`）。

### 播放中：全局键位

| 键 | 功能 |
| ---- | ---- |
| `a` | 打开高级菜单（制卡主界面） |
| `g` / `Alt+g` | 快速制卡菜单（后者先选目标卡片） |
| `Ctrl+n` | **一键制卡**：以当前显示的字幕行为卡片内容（字幕时间轴准时用这个最快） |
| `H` / `L` | 跳到上一句 / 下一句字幕 |
| `Alt+h` / `Alt+l` | 跳到上一句 / 下一句字幕并暂停 |
| `Ctrl+h` | 跳回当前句开头（「刚才那句说什么？」） |
| `Ctrl+H` | 重播当前句并暂停 |
| `Ctrl+L` | 播到下一句结束并暂停（逐句精听模式） |
| `Ctrl+c` / `Ctrl+C` | 复制当前主 / 次字幕文本到剪贴板 |
| `Ctrl+t` | 开关「自动复制字幕到剪贴板」 |
| `Ctrl+b` / `Ctrl+B` | 追加 / 覆盖**选中的** Anki 卡片的媒体字段 |
| `Ctrl+m` / `Ctrl+M` | 追加 / 覆盖**最新一张** Anki 卡片的媒体字段 |
| `Ctrl+g` | 开关动画截图（生成短视频片段代替静态图） |
| `Ctrl+v` | 次字幕显示开关 |
| `Ctrl+k` / `Ctrl+j` | 次字幕轨切换（前一个 / 后一个） |

> [!NOTE]
> 安装 mpvacious 后，`H`/`L`/`Ctrl+c` 等键会被它占用，mpv 原生对应功能（如 `Ctrl+left/right` 逐句跳）不受影响，但自定义 `input.conf` 时注意避开。

### 菜单内（按 `a` 进入后）

| 键 | 功能 |
| ---- | ---- |
| `n` | **用当前选定范围制卡** |
| `c` | 交互式选择字幕行范围 |
| `Shift+s` / `Shift+e` | 以当前字幕行为起点 / 终点设定范围 |
| `s` / `e` | 手动设定精确起点 / 终点时间 |
| `m` / `Shift+m` | 追加 / 覆盖更新最后一张卡 |
| `b` / `Shift+b` | 追加 / 覆盖更新选中的卡 |
| `f` / `Shift+f` | 增 / 减一次要更新的卡片数 |
| `z` / `Shift+z` | 字幕提前 / 延后 |
| `p` | 切换配置 profile |
| `i` | 切换显示模式 |
| `r` | 清除已保存的字幕时间记录 |

## 完整工作流演示

以一集英字美剧为例，把前面的工具全部串起来：

1. **开场**：打开 Anki（保持后台运行），mpv 打开视频，确认英文字幕轨已加载。
2. **沉浸**：正常看剧，遇到含生词的句子，`Ctrl+h` 跳回句首重听确认。
3. **制卡**：
   - 字幕时间轴准时——直接 `Ctrl+n`，当前字幕行连同音频、截图瞬间进 Anki；
   - 句子跨了多行字幕或时间轴不齐——按 `a` 进菜单，`Shift+s` / `Shift+e`（或 `s` / `e`）调好范围，`n` 制卡。期间可用 `[` `]` 降速精修。
4. **查词义**（可选）：`Ctrl+c` 复制句子，浏览器里用 [Yomitan](/guides/yomitan/) 查生词，把释义补进卡片——或者直接用 Yomitan 自己的加卡功能建词卡，与句子卡互补。
5. **第二天**：Anki 到期复习，看句子回想词义，听音频强化辨音。

熟练后第 3 步只需几秒，一集剧挖 10–20 张卡毫无压力。

## 进阶配置

### 多语言 / 多牌组 profile

同时学多门语言、或想把不同内容的卡分牌组？新建 `subs2srs_profiles.conf`（与 `subs2srs.conf` 同目录）：

```ini
profiles=subs2srs,english
active=subs2srs
```

再为每个 profile 建独立配置文件，如 `english.conf`：

```ini
deck_name=English sentence mining
model_name=General
sentence_field=Question
audio_field=Audio
image_field=Extra
```

播放中按 `a` → `p` 即可切换。

### 次字幕（母语翻译）进卡片

若你有双语字幕（如英语主字幕 + 中文次字幕，见 [mpv 篇](/guides/mpv/#双语字幕次字幕)），可在配置中把翻译写进单独字段：

```ini
secondary_field=Translation
secondary_sub_lang=chi,zho
```

配置 `secondary_sub_lang` 后无需手动 `--secondary-sid`，mpv 自动匹配语言。

### 自动补媒体

开启后，mpvacious 会周期性检查 Anki 里**外部新建**的笔记（例如 Yomitan 制的词卡），自动补上音频和截图，不再需要手动按 `Ctrl+m`：

```ini
enable_new_note_timer=yes
new_note_timer_interval_seconds=5
```

（需同时指定 `deck_name` 与 `model_name`。）

## 常见问题

- **制卡失败 / 无反应**：按顺序检查——桌面版 Anki 开了吗？AnkiConnect 装了吗？端口 8765 被占用？牌组名、笔记类型名是否与配置完全一致？
- **卡片里没有音频或截图**：装 ffmpeg 并设 `use_ffmpeg=yes`；老设备兼容性问题可改 `audio_format=mp3`、`snapshot_format=jpg`。
- **音频片段掐头去尾**：字幕时间轴不准。菜单里 `z` / `Shift+z` 整体平移字幕，或用 `Shift+s` / `Shift+e` 手动圈范围。
- **首字段显示 `[empty]`**：把句子字段调到笔记类型第一位。
- **手机上能复习吗**：可以。制卡依赖桌面端 Anki，但同步到 AnkiWeb/AnkiMobile 后，复习随时随地都能做。

## 系列回顾

至此，[Refold 路线图](/guides/refold-roadmap/)给方法，[Anki](/guides/anki-srs/)管记忆，[Yomitan](/guides/yomitan/)管查词，[mpv](/guides/mpv/)管播放，mpvacious 把最后一块拼图放上——从看剧到复习的闭环正式跑通。剩下的，就是每天打开一集剧，开始你的沉浸。
