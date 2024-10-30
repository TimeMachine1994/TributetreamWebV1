<?php
/* 
* Template Name: Celebration of Life
*/
define('HIDE_HEADER_FOOTER', true);
?>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fanwood+Text:ital@0;1&family=ABeeZee&display=swap');

body {
    margin: 0;
    overflow-x: hidden;
    font-family: 'ABeeZee', sans-serif;
    background-color: #2a2a2a;
    color: #e0e0e0;
}

.celebration-hero {
    background: linear-gradient(rgba(218, 165, 32, 0.4), rgba(218, 165, 32, 0.4)),
                url('http://tributestream.com/wp-content/uploads/2019/11/candle-PEVB9JR-scaled.jpg') center center / cover no-repeat;
    height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #fff;
    padding: 20px;
}

.celebration-hero h1 {
    font-family: 'Fanwood Text', serif;
    font-size: 4vw;
    font-style: italic;
    font-weight: 300;
    color: #fff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    margin: 0;
    max-width: 90%;
}

.content-wrapper {
    padding: 60px 20px 80px;
}

.video-frame {
    max-width: 800px;
    height: 450px;
    margin: 20px auto 50px;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18px;
    border-radius: 8px;
    overflow: hidden;
}

.faq-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    justify-content: space-between;
}

.faq-column {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.faq-column:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.faq-column h3 {
    font-size: 1.2em;
    color: #fff;
    margin-bottom: 15px;
    position: relative;
}

.faq-column h3::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 50px;
    height: 2px;
    background: #DAA520;
}

.faq-column p {
    font-size: 1em;
    line-height: 1.6;
    color: #e0e0e0;
    margin: 0;
}
</style>

<div class="celebration-hero">
    <h1>Celebration of Life for <?php echo get_the_title(); ?></h1>
</div>

<div class="content-wrapper">
    <div class="video-frame">
        Video Placeholder
    </div>

    <div class="faq-container">
        <div class="faq-column">
            <h3>What is a Tributestream?</h3>
            <p>A Tributestream® is a livestream of a loved one’s memorial service. It allows friends and family across the globe to participate.</p>
        </div>
        <div class="faq-column">
            <h3>Why isn’t the video playing?</h3>
            <p>Some browsers require you to manually start the video by tapping it and clicking 'Play'.</p>
        </div>
        <div class="faq-column">
            <h3>Why can’t I hear anything?</h3>
            <p>Ensure your device is unmuted and check the player’s volume controls.</p>
        </div>
    </div>
</div>
