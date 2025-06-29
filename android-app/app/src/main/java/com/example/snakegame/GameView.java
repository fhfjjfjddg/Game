package com.example.snakegame;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Point;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class GameView extends View {

    private static final int GRID_SIZE = 20;
    private static final int GAME_SPEED_MS = 200;

    private List<Point> snake;
    private Point food;
    private Direction direction = Direction.RIGHT;
    private int score = 0;
    private boolean isGameOver = false;
    private boolean isGameRunning = false;

    private Paint snakePaint;
    private Paint foodPaint;
    private Paint textPaint;

    private TextView scoreTextView;
    private float lastTouchX, lastTouchY;

    private enum Direction {
        UP, DOWN, LEFT, RIGHT
    }

    public GameView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    private void init() {
        snake = new ArrayList<>();
        snakePaint = new Paint();
        snakePaint.setColor(Color.GREEN);
        foodPaint = new Paint();
        foodPaint.setColor(Color.RED);
        textPaint = new Paint();
        textPaint.setColor(Color.WHITE);
        textPaint.setTextSize(60);
    }

    public void setScoreTextView(TextView textView) {
        this.scoreTextView = textView;
    }

    public void startGame() {
        snake.clear();
        snake.add(new Point(GRID_SIZE / 2, GRID_SIZE / 2));
        generateFood();
        direction = Direction.RIGHT;
        score = 0;
        isGameOver = false;
        isGameRunning = true;
        updateScore();
        post(gameLoop);
    }

    private void generateFood() {
        Random random = new Random();
        int x, y;
        do {
            x = random.nextInt(GRID_SIZE);
            y = random.nextInt(GRID_SIZE);
        } while (isSnakeAt(x, y));
        food = new Point(x, y);
    }

    private boolean isSnakeAt(int x, int y) {
        for (Point p : snake) {
            if (p.x == x && p.y == y) {
                return true;
            }
        }
        return false;
    }

    private void updateGame() {
        if (isGameOver) {
            isGameRunning = false;
            return;
        }

        Point head = new Point(snake.get(0));
        switch (direction) {
            case UP:
                head.y--;
                break;
            case DOWN:
                head.y++;
                break;
            case LEFT:
                head.x--;
                break;
            case RIGHT:
                head.x++;
                break;
        }

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE || isSnakeAt(head.x, head.y)) {
            isGameOver = true;
            return;
        }

        snake.add(0, head);

        if (head.equals(food)) {
            score++;
            updateScore();
            generateFood();
        } else {
            snake.remove(snake.size() - 1);
        }
    }

    private void updateScore() {
        scoreTextView.setText("Score: " + score);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (!isGameRunning && !isGameOver) return;

        int cellSize = getWidth() / GRID_SIZE;
        for (Point p : snake) {
            canvas.drawRect(p.x * cellSize, p.y * cellSize, (p.x + 1) * cellSize, (p.y + 1) * cellSize, snakePaint);
        }

        canvas.drawRect(food.x * cellSize, food.y * cellSize, (food.x + 1) * cellSize, (food.y + 1) * cellSize, foodPaint);

        if (isGameOver) {
            canvas.drawText("Game Over", getWidth() / 2 - 150, getHeight() / 2, textPaint);
            // Show restart button logic is in MainActivity
        }
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                lastTouchX = event.getX();
                lastTouchY = event.getY();
                break;
            case MotionEvent.ACTION_UP:
                float dx = event.getX() - lastTouchX;
                float dy = event.getY() - lastTouchY;
                if (Math.abs(dx) > Math.abs(dy)) {
                    if (dx > 0 && direction != Direction.LEFT) {
                        direction = Direction.RIGHT;
                    } else if (dx < 0 && direction != Direction.RIGHT) {
                        direction = Direction.LEFT;
                    }
                } else {
                    if (dy > 0 && direction != Direction.UP) {
                        direction = Direction.DOWN;
                    } else if (dy < 0 && direction != Direction.DOWN) {
                        direction = Direction.UP;
                    }
                }
                break;
        }
        return true;
    }

    private final Runnable gameLoop = new Runnable() {
        @Override
        public void run() {
            if (isGameRunning) {
                updateGame();
                invalidate(); // Redraw the view
                postDelayed(this, GAME_SPEED_MS);
            }
        }
    };
}
