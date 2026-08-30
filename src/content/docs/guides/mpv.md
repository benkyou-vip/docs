---
title: mpv 播放器与 mpvacious 制卡
description: mpv 播放器的安装、快捷键与配置，以及 mpvacious 制卡插件的安装、配置与用法。
---

[mpv](https://mpv.io) 是一个轻量、以键盘操作为主的播放器，支持脚本扩展。[mpvacious](https://github.com/Ajatt-Tools/mpvacious) 是运行在 mpv 内的 Lua 脚本，用于在播放视频时把当前句子的文本、音频和截图发送到 Anki。

## mpv

### 安装

| 系统 | 方式 |
| ---- | ---- |
| Windows | 从 [mpv.io](https://github.com/mpv-player/mpv/releases/latest) 下载安装包 |
| macOS | `brew install mpv` |
| Linux | 发行版包管理器安装，如 `sudo pacman -S mpv` / `sudo apt install mpv` |

验证安装：

```sh
mpv --version
```

### 基本用法

```sh
mpv video.mkv              # 播放文件
mpv ~/Videos/series/       # 播放整个文件夹（形成播放列表）
mpv 'https://www.youtube.com/watch?v=...'  # 播放网络视频
```

也可以直接把文件拖放到 mpv 窗口上。

> [!TIP]
> 播放 YouTube 等网络视频需要系统里装有 [yt-dlp](https://github.com/yt-dlp/yt-dlp)。装好后 `mpv 链接` 即可，字幕与快捷键功能均可用。

### 常用快捷键

> [!TIP]
> 以下均为默认键位。在终端运行 `mpv --input-test --force-window --idle`，随后按键，屏幕上会显示按键对应的功能。

#### 播放控制

| 键 | 功能 |
| ---- | ---- |
| `Space` / `p` | 播放 / 暂停 |
| `.` / `,` | 前进 / 后退一帧（自动暂停） |
| `q` | 退出 |
| `Q` | 退出并记住播放位置，下次打开继续 |
| `f` | 切换全屏 |
| `T` | 窗口置顶开关 |

#### 跳转

| 键 | 功能 |
| ---- | ---- |
| `←` / `→` | 后退 / 前进 5 秒 |
| `Shift+←` / `→` | 后退 / 前进 1 秒 |
| `↑` / `↓` | 后退 / 前进 1 分钟 |
| `Ctrl+←` / `→` | 跳到上一句 / 下一句字幕 |
| `Home` | 回到开头 |

#### 播放速度

| 键 | 功能 |
| ---- | ---- |
| `[` / `]` | 语速减 / 增 10% |
| `{` / `}` | 语速减半 / 加倍 |
| `Backspace` | 恢复正常语速（1.0x） |

#### 音量与音轨

| 键 | 功能 |
| ---- | ---- |
| `9` / `0`（或 `/` `*`） | 音量减 / 增 |
| `m` | 静音开关 |
| `#` | 切换音轨 |

#### 字幕

| 键 | 功能 |
| ---- | ---- |
| `j` / `J` | 切换字幕轨 |
| `z` / `Z` | 字幕时间轴前移 / 后移 0.1 秒 |
| `v` | 隐藏 / 显示字幕 |
| `G` / `F` | 增大 / 减小字幕字号（大写；小写 `f` 是全屏） |
| `r` / `R` | 字幕位置上移 / 下移 |

#### 截图与循环

| 键 | 功能 |
| ---- | ---- |
| `s` | 截图（原始分辨率，含字幕） |
| `S` | 截图（原始分辨率，不含字幕） |
| `Ctrl+s` | 按窗口所见截图（含界面与字幕） |
| `l` | 设置 / 清除 A-B 循环点（按两次分别设 A、B 点，再按清除） |
| `L` | 当前文件循环播放 |

### 字幕操作

加载字幕的方式：

- 把字幕文件重命名为与视频相同的文件名，放在同一目录下，mpv 打开视频时自动加载（如 `movie.mkv` 和 `movie.eng.srt`）；
- 播放中把字幕文件拖入窗口；
- 按 `g` 再按 `s`，调出字幕选择菜单。

mpv 可同时显示两条字幕（如底部目标语言主字幕、顶部母语次字幕）：

```sh
mpv video.mkv --secondary-sid=auto --slang=eng
```

播放中按 `Alt+v` 开关次字幕。

### 听不清时的操作

1. 按 `Ctrl+←` 跳回当前句开头；
2. 仍听不清时按 `[` 降低语速（如降到 0.8x）；
3. 字幕与声音不同步时按 `z` / `Z` 平移字幕；
4. 听清后按 `Backspace` 恢复正常语速。

### 配置文件

| 系统 | 配置目录 |
| ---- | ---- |
| Linux / macOS | `~/.config/mpv/` |
| Windows | `C:/Users/用户名/AppData/Roaming/mpv/` |

`mpv.conf` 为全局播放设置，适合语言学习的示例：

```ini
volume=100
sub-auto=fuzzy
slang=eng,en
alang=eng
```

`input.conf` 用于自定义键位。示例（把字幕平移精度设为 50ms）：

```ini
Z add sub-delay +0.05
z add sub-delay -0.05
```

## mpvacious

### 工作原理

遇到需要记录的台词时，mpvacious 通过快捷键提取当前句子的文本、音频和截图，发送到 Anki，无需切换窗口或手动截图。流程如下：

1. 读取当前选中的字幕文本及时间轴；
2. 根据时间轴提取对应的音频片段和画面截图；
3. 通过本机 8765 端口调用 AnkiConnect，把内容写入 Anki 笔记。

制卡依赖字幕文件，字幕时间轴越准确，截取效果越好。

### 前置条件

| 依赖 | 说明 |
| ---- | ---- |
| mpv | v0.41.0 或更新版本 |
| Anki | 桌面版，制卡时需保持运行 |
| AnkiConnect | Anki 插件，安装代码 2055492159 |
| curl | 用于发送 HTTP 请求（Windows 10+ 及 macOS/Linux 通常自带） |
| ffmpeg | 可选。用于精确处理音频和截图，默认截取功能出现问题时建议安装 |

检查 mpv 是否支持内置编码（不支持也可安装 ffmpeg 后设置 `use_ffmpeg=yes`）：

```sh
mpv test_video.mkv --loop-file=no --frames=1 -o=test_image.jpg
```

### 安装

Linux / macOS 一键脚本：

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Ajatt-Tools/mpvacious/HEAD/scripts/install.sh)"
```

或 git 方式（便于 `git pull` 更新）：

```sh
mkdir -p ~/.config/mpv/scripts/
git clone https://github.com/Ajatt-Tools/mpvacious.git ~/.config/mpv/scripts/mpvacious
```

Windows PowerShell 一键脚本：

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

Arch 用户可直接安装 AUR 包 `mpv-mpvacious`。

安装成功后，播放任意视频时按 `a` 会出现 mpvacious 菜单。

### 配置文件

| 系统 | 位置 |
| ---- | ---- |
| Linux / macOS | `~/.config/mpv/script-opts/subs2srs.conf` |
| Windows | `C:/Users/用户名/AppData/Roaming/mpv/script-opts/subs2srs.conf` |

配合 [Anki 篇](/guides/anki-srs/#安装-lapis-模板)安装的 Lapis 笔记类型，英语挖句的最小配置：

<!-- TODO: 补全配合 Lapis 的最小配置（deck_name、model_name 与各字段映射） -->

配置说明：

- 字段名必须与 Anki 里的笔记类型完全一致（区分大小写），否则数据无法写入；
- 句子字段应设为笔记类型的第一个字段，首字段为空时 mpvacious 会填入 `[empty]` 占位；
- 已安装 ffmpeg 时，建议在配置中添加 `use_ffmpeg=yes`。

完整可配置项见仓库内的 `mpvacious/config/default_config.conf`。

### 键位

以下均为默认键位（大写字母表示需要按 Shift，如 `Ctrl+M` 实际是 `Ctrl+Shift+m`）。

播放中的全局键位：

| 键 | 功能 |
| ---- | ---- |
| `a` | 打开高级菜单（制卡主界面） |
| `g` / `Alt+g` | 快速制卡菜单（后者先选目标卡片） |
| `Ctrl+n` | 以当前显示的字幕行一键制卡 |
| `H` / `L` | 跳到上一句 / 下一句字幕 |
| `Alt+h` / `Alt+l` | 跳到上一句 / 下一句字幕并暂停 |
| `Ctrl+h` | 跳回当前句开头 |
| `Ctrl+H` | 重播当前句并暂停 |
| `Ctrl+L` | 播到下一句结束并暂停（逐句精听） |
| `Ctrl+c` / `Ctrl+C` | 复制当前主 / 次字幕文本到剪贴板 |
| `Ctrl+t` | 开关「自动复制字幕到剪贴板」 |
| `Ctrl+b` / `Ctrl+B` | 追加 / 覆盖选中的 Anki 卡片的媒体字段 |
| `Ctrl+m` / `Ctrl+M` | 追加 / 覆盖最新一张 Anki 卡片的媒体字段 |
| `Ctrl+g` | 开关动画截图（生成短视频片段代替静态图） |
| `Ctrl+v` | 次字幕显示开关 |
| `Ctrl+k` / `Ctrl+j` | 次字幕轨切换（前一个 / 后一个） |

菜单内键位（按 `a` 进入后）：

| 键 | 功能 |
| ---- | ---- |
| `n` | 用当前选定范围制卡 |
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

> [!NOTE]
> 安装 mpvacious 后，`H` / `L` / `Ctrl+c` 等键会被其占用（mpv 原生的 `Ctrl+←` / `→` 逐句跳转不受影响），自定义 `input.conf` 时注意避开这些键。

### 使用流程

以英语学习为例：

1. 保持 Anki 桌面版运行；
2. 用 mpv 打开视频，确保目标语言字幕已加载；
3. 遇到需要制卡的句子时，按 `Ctrl+h` 跳回当前句开头；
4. 制卡：
   - 时间轴准确时直接按 `Ctrl+n`，当前字幕行连同音频、截图自动发送至 Anki；
   - 句子跨行或时间轴不准时，按 `a` 打开菜单，用 `s`（起点）和 `e`（终点）设定范围后按 `n` 制卡；
5. 可选用快捷键复制句子文本，在浏览器中用 Yomitan 查词并补充释义。

### 进阶配置

同时学多门语言、或要把不同内容的卡分牌组时，可使用 profile。新建 `subs2srs_profiles.conf`（与 `subs2srs.conf` 同目录）：

```ini
profiles=subs2srs,english
active=subs2srs
```

再为每个 profile 建独立配置文件，如 `english.conf`：

<!-- TODO: 补全 profile 的配置示例 -->

播放中按 `a` → `p` 切换 profile。

使用双语字幕时（见上文「字幕操作」），可把次字幕翻译写入卡片单独字段：

<!-- TODO: 补全 secondary_field（映射到 Lapis 的哪个字段）与 secondary_sub_lang 示例 -->

配置 `secondary_sub_lang` 后无需手动 `--secondary-sid`，mpv 会自动匹配语言。

开启自动补媒体后，mpvacious 会周期性检查 Anki 里外部新建的笔记（例如 Yomitan 制的词卡），自动补上音频和截图：

```ini
enable_new_note_timer=yes
new_note_timer_interval_seconds=5
```

需同时指定 `deck_name` 与 `model_name`。

### 常见问题

- **制卡无反应**：检查桌面版 Anki 是否开启、AnkiConnect 是否安装、配置文件中的牌组名和笔记类型名是否拼写正确；
- **卡片缺失音频或截图**：安装 ffmpeg 并在配置文件中添加 `use_ffmpeg=yes`；
- **首字段显示 `[empty]`**：在 Anki 中把句子字段移动到该笔记类型的第一位。
