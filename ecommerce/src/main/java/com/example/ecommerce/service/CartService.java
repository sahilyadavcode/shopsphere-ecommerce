package com.example.ecommerce.service;

import com.example.ecommerce.dto.request.AddToCartRequest;
import com.example.ecommerce.dto.response.CartItemResponse;
import com.example.ecommerce.dto.response.CartResponse;
import com.example.ecommerce.dto.response.CategoryResponse;
import com.example.ecommerce.dto.response.ProductResponse;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.model.Cart;
import com.example.ecommerce.model.CartItem;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartResponse getCart(Long userId) {
        Cart cart = findOrCreateCart(userId);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        Cart cart = findOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("This product is no longer available");
        }

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId())
                .orElse(null);

        int requestedTotalQty = request.getQuantity() + (existingItem != null ? existingItem.getQuantity() : 0);
        if (requestedTotalQty > product.getStockQuantity()) {
            throw new InsufficientStockException("Only " + product.getStockQuantity() + " units of '" + product.getName() + "' are in stock");
        }

        if (existingItem != null) {
            existingItem.setQuantity(requestedTotalQty);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return toResponse(cartRepository.save(cart));
    }

    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long itemId, int quantity) {
        Cart cart = findOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (quantity > item.getProduct().getStockQuantity()) {
            throw new InsufficientStockException("Only " + item.getProduct().getStockQuantity() + " units of '" + item.getProduct().getName() + "' are in stock");
        }

        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = findOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return toResponse(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = findOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    protected Cart findOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    throw new ResourceNotFoundException("Cart not found for user. Please contact support.");
                });
    }

    private CartResponse toResponse(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .items(cart.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()))
                .totalAmount(total)
                .build();
    }

    private CartItemResponse toItemResponse(CartItem item) {
        Product product = item.getProduct();
        CategoryResponse categoryResponse = null;
        if (product.getCategory() != null) {
            categoryResponse = CategoryResponse.builder()
                    .id(product.getCategory().getId())
                    .name(product.getCategory().getName())
                    .build();
        }

        ProductResponse productResponse = ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stockQuantity(product.getStockQuantity())
                .imageUrl(product.getImageUrl())
                .category(categoryResponse)
                .active(product.isActive())
                .build();

        return CartItemResponse.builder()
                .id(item.getId())
                .product(productResponse)
                .quantity(item.getQuantity())
                .subtotal(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}
