package com.example.ecommerce.config;

import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Set;

/**
 * Seeds the database with a demo admin account, categories, and products
 * on first startup so the app is immediately explorable.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCatalog();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@shop.com")) {
            return;
        }
        User admin = User.builder()
                .fullName("Store Admin")
                .email("admin@shop.com")
                .password(passwordEncoder.encode("Admin@123"))
                .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_CUSTOMER))
                .build();
        admin = userRepository.save(admin);
        cartRepository.save(Cart.builder().user(admin).build());
    }

    private void seedCatalog() {
        if (categoryRepository.count() > 0) {
            return;
        }

        Category electronics = categoryRepository.save(
                Category.builder().name("Electronics").description("Gadgets and devices").build());
        Category apparel = categoryRepository.save(
                Category.builder().name("Apparel").description("Clothing and accessories").build());
        Category home = categoryRepository.save(
                Category.builder().name("Home & Kitchen").description("Everything for your home").build());

        productRepository.save(Product.builder()
                .name("Wireless Headphones")
                .description("Over-ear headphones with active noise cancellation")
                .price(new BigDecimal("79.99"))
                .stockQuantity(50)
                .imageUrl("https://placehold.co/400x400?text=Headphones")
                .category(electronics)
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Smart Watch")
                .description("Fitness tracking smart watch with heart-rate monitor")
                .price(new BigDecimal("129.99"))
                .stockQuantity(30)
                .imageUrl("https://placehold.co/400x400?text=Smart+Watch")
                .category(electronics)
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Classic T-Shirt")
                .description("100% cotton crew neck t-shirt")
                .price(new BigDecimal("19.99"))
                .stockQuantity(100)
                .imageUrl("https://placehold.co/400x400?text=T-Shirt")
                .category(apparel)
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Denim Jacket")
                .description("Classic fit denim jacket")
                .price(new BigDecimal("59.99"))
                .stockQuantity(40)
                .imageUrl("https://placehold.co/400x400?text=Denim+Jacket")
                .category(apparel)
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Ceramic Cookware Set")
                .description("8-piece non-stick ceramic cookware set")
                .price(new BigDecimal("149.99"))
                .stockQuantity(20)
                .imageUrl("https://placehold.co/400x400?text=Cookware")
                .category(home)
                .active(true)
                .build());

        productRepository.save(Product.builder()
                .name("Aroma Diffuser")
                .description("Ultrasonic essential oil diffuser with LED lighting")
                .price(new BigDecimal("34.99"))
                .stockQuantity(60)
                .imageUrl("https://placehold.co/400x400?text=Diffuser")
                .category(home)
                .active(true)
                .build());
    }
}
