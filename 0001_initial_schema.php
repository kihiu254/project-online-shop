<?php
// Initial Database Migration - Creates all tables from schema.sql
class Migration_0001_initial_schema {
    public function up($db) {
        // Execute the schema.sql file
        $schema = file_get_contents(__DIR__ . '/../../schema.sql');
        $db->exec($schema);

        // Insert initial data if needed
        $this->seedInitialData($db);
    }

    public function down($db) {
        // Drop all tables (for rollback)
        $tables = [
            'users', 'categories', 'products', 'product_images', 'product_variants',
            'orders', 'order_items', 'payments', 'shipping_methods', 'order_shipping',
            'reviews', 'wishlists', 'carts', 'cart_items', 'discounts'
        ];

        foreach ($tables as $table) {
            $db->exec("DROP TABLE IF EXISTS $table");
        }
    }

    private function seedInitialData($db) {
        // Example: Insert default admin user
        $stmt = $db->prepare("
            INSERT INTO users (username, email, password_hash, is_admin)
            VALUES (:username, :email, :password, 1)
        ");
        $stmt->execute([
            ':username' => 'admin',
            ':email' => 'admin@lunaluxe.com',
            ':password' => password_hash('admin123', PASSWORD_DEFAULT)
        ]);

        // Example: Insert default categories
        $categories = ['Clothing', 'Accessories', 'Footwear', 'Jewelry'];
        foreach ($categories as $category) {
            $db->exec("INSERT INTO categories (name) VALUES ('$category')");
        }
    }
}
