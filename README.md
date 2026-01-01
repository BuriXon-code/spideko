# Spideko 🕷️ Your little helper in catching bugs

![Banner](/banner.gif)

## About

Spideko is a playful, web-friendly alternative to the beloved Oneko cat, designed specifically for spider enthusiasts. Instead of the iconic white cat, you'll meet a charming **Brachypelma Boehmei** tarantula living its own little digital life. This spider doesn't just wander the screen—it battles the cursor and hunts down pesky bugs hiding in your website code, acting like a true web developer at work.  

Under the hood, Spideko is a lightweight **JavaScript script/library** compatible with all modern browsers, except Internet Explorer (more on that below). Simply include it in your site and watch your spider patrol, chase, and hunt across your pages.

---

## Features

Spideko is a smooth, lightweight script with plenty of fun features for web developers and curious visitors alike:

- **Lightweight:** Minimal impact on page load.
- **Cross-browser:** Works on all modern browsers (except IE).
- **Easy installation:** One line of code and your spider is ready to roam.
- **Beautiful animations:** High-quality GIF frames with smooth transitions.
- **Bug-hunting simulation:** Your spider chases down bugs (or coding bugs!) in a fun visual way.
- **Interactive:** Responds to cursor movement with engaging behaviors.
- **Customizable:** Adjust speed, interaction intensity, number of cockroaches, and more.
- **Multiple uses:** Can be included on multiple pages or used with custom frame directories.
- **Fun visual feedback:** Webmasters get to see their spider “work” while users are entertained.

> [!NOTE]
> To see Spideko in action, visit my website [burixon.dev](https://burixon.dev)

---

## Installation

To install Spideko, simply clone the repository into the target HTTP server directory:

```sh
# Clone the repository:
git clone https://github.com/BuriXon-code/spideko
```

After that, open your browser at `your-website.xyz/spideko/index.html` and your spider will be alive!  

If you want to include the script elsewhere, move the GIF frames and the JS file to your chosen directories:

```sh
# 1. Enter the cloned repo:
cd spideko
```

```sh
# 2. Move the animation directories to your frames folder:
mv "{spider,roach}_anim" /frames/dir/
```

```sh
# 3. Move spideko.js to your desired directory:
mv spideko.js /spideko/dir/
```

Then edit your target HTML by adding one line before `</body>` tag:

```html
<script src="/spideko/dir/spideko.js"></script>
```

And make sure to update the paths inside `spideko.js` for:

- `spiderFramesPath`
- `roachFramesPath`
- `webImgPath`  

These paths must point to the correct relative or absolute locations of your frames and images.

> [!NOTE]
> The included index.html and banner.gif files are merely demonstration files for the script. They have no value or significance within the project.

---

## Configuration

Spideko is highly configurable through the `S` object. You can customize:

- **Sizes**  
  - `spiderSize`: Spider width in pixels  
  - `roachMinSize`, `roachMaxSize`: Cockroach width range in pixels  

- **Paths & frames**  
  - `spiderFramesPath`, `roachFramesPath`, `webImgPath` : Paths to GIFs paths
  - `spiderFramesCount`, `roachFramesCount`: Number of frames in each GIF  

- **Speeds**  
  - `spiderBaseSpeed`: Idle movement speed  
  - `spiderAngrySpeed`: Speed when attacking or chasing  
  - `spiderChaseSpeed`: Maximum chase speed  
  - `roachSpeed`: Cockroach movement speed  

- **Interaction distances**  
  - `catchDist`: Distance to catch a roach  
  - `grabDist`: Distance to catch the cursor  

- **Idle wandering**  
  - `idleWanderAfterMs`: Time before wandering starts  
  - `idleWanderPauseMin`, `idleWanderPauseMax`: Pauses between wandering  

- **Cursor hunting**  
  - `attackChance`: Probability spider attacks cursor  
  - `webChance`: Probability spider spins a web  
  - `cursorSitChance`: Probability spider sits on cursor  
  - `attackMinHits`, `attackMaxHits`: Number of consecutive attacks  
  - `webMinMs`, `webMaxMs`: Web duration in milliseconds  
  - `webSizeMin`, `webSizeMax`: Web size in pixels  

- **Ignoring cursor**  
  - `ignoreCursorChance`: Chance spider ignores cursor temporarily  
  - `ignoreCursorDurationMin`, `ignoreCursorDurationMax`: Duration of ignoring  

- **Movement & animations**  
  - `wobbleAmplitude`: Spider wobble while walking  
  - `wanderWobbleAmplitude`: Wobble during idle wandering  
  - `spiderAnimSpeedMul`: Multiplier for frame change speed  

- **Roach spawn timing & count**  
  - `roachSpawnMinMs`, `roachSpawnMaxMs`: Interval between roach spawns  
  - `roachSpawnMaxCount`: Maximum number of roaches on screen  

This configuration allows you to fully tailor Spideko’s behavior, speed, and interaction intensity.

---

## Compatibility

- **JavaScript:** ES6+ features (const, arrow functions, template literals)  
- **Browsers:** Chrome, Firefox, Edge, Safari, Opera  
- **Not supported!:** Internet Explorer (IE) due to lack of modern JS support  
- **Important:** Any browser animation optimizations should be disabled to ensure smooth spider movement.  

---

## License

Spideko is released under the **GPLv3 license**.  

You are free to:

- Use, modify, and redistribute the script  
- Include it in personal or commercial projects  

You **cannot**:

- Remove or change the license without keeping it compliant with GPLv3  
- Claim the project as entirely your own  

For full license details, see [GPLv3](https://www.gnu.org/licenses/gpl-3.0.html).

---

Enjoy watching your Brachypelma Boehmei patrol your website! 🕷️💻

## Support
### Contact me:
For any issues, suggestions, or questions, reach out via:

- *Email:* support@burixon.dev
- *Contact form:* [Click here](https://burixon.dev/contact/)
- *Bug reports:* [Click here](https://burixon.dev/bugreport/#spideko)

### Support me:
If you find this script useful, consider supporting my work by making a donation:

[**Donations**](https://burixon.dev/donate/) ☕

Your contributions help in developing new projects and improving existing tools!

---

And for now - **have fun** 🕷️🪳 !
