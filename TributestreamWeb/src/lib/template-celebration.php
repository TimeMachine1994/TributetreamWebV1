<?php
/**
 * Template Name: Celebration of Life
 * Description: A template for creating a "Celebration of Life" page with a hero title and a video frame.
 */

get_header(); // Include the header of the theme
?>

<style>
    /* Basic CSS for the hero section and video frame */
    .celebration-hero {
        background-color: #f3f3f3;
        padding: 50px 20px;
        text-align: center;
    }
    .celebration-hero h1 {
        font-size: 36px;
        color: #333;
    }
    .video-frame {
        width: 100%;
        max-width: 800px;
        height: 450px;
        margin: 30px auto;
        background-color: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 18px;
    }
</style>

<div class="celebration-hero">
    <h1>Celebration of Life for <?php echo get_the_title(); ?></h1>
</div>

<div class="video-frame">
    <!-- Empty video frame, you can embed a video or leave it as a placeholder -->
    Video Placeholder
</div>

<?php
get_footer(); // Include the footer of the theme
