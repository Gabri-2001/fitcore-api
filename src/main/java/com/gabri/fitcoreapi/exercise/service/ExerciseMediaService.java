package com.gabri.fitcoreapi.exercise.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.exercise.repository.ExerciseVariantRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;

@Service
public class ExerciseMediaService {
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final ExerciseVariantRepository variants;
    private final Path storageDirectory;
    private final String publicBaseUrl;

    public ExerciseMediaService(ExerciseVariantRepository variants,
            @Value("${app.media.exercise-storage-dir:./data/exercise-media}") String storageDirectory,
            @Value("${app.media.exercise-base-url:/media/exercises}") String publicBaseUrl) {
        this.variants = variants;
        this.storageDirectory = Path.of(storageDirectory).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl.replaceAll("/$", "");
    }

    @Transactional
    public ExerciseVariant upload(String variantCode, MultipartFile image, String altText) {
        ExerciseVariant variant = variants.findByCodeAndActiveTrue(variantCode)
                .orElseThrow(() -> new com.gabri.fitcoreapi.common.exception.ResourceNotFoundException(
                        "Exercise variant not found with code: " + variantCode));
        if (image == null || image.isEmpty()) throw new BusinessRuleException("An image file is required");
        if (altText == null || altText.isBlank()) throw new BusinessRuleException("Accessible image text is required");
        if (altText.length() > 240) throw new BusinessRuleException("Accessible image text cannot exceed 240 characters");
        String extension = EXTENSIONS.get(image.getContentType());
        if (extension == null) throw new BusinessRuleException("Only JPEG, PNG and WebP exercise images are supported");
        if (!hasValidSignature(image, image.getContentType())) {
            throw new BusinessRuleException("The uploaded file content does not match its image type");
        }

        String fileName = variant.getCode().replaceAll("[^a-zA-Z0-9_-]", "-") + extension;
        Path destination = storageDirectory.resolve(fileName).normalize();
        if (!destination.startsWith(storageDirectory)) throw new BusinessRuleException("Invalid media path");
        try {
            Files.createDirectories(storageDirectory);
            Files.copy(image.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new BusinessRuleException("The exercise image could not be stored");
        }

        String url = publicBaseUrl + "/" + fileName;
        variant.updateMedia(url, url, altText.trim());
        return variant;
    }

    @Transactional(readOnly = true)
    public Resource load(String fileName) {
        if (fileName == null || !fileName.matches("[a-zA-Z0-9_-]+\\.(jpg|png|webp)")) {
            throw new com.gabri.fitcoreapi.common.exception.ResourceNotFoundException("Exercise image not found");
        }
        Path file = storageDirectory.resolve(fileName).normalize();
        if (!file.startsWith(storageDirectory) || !Files.isRegularFile(file)) {
            throw new com.gabri.fitcoreapi.common.exception.ResourceNotFoundException("Exercise image not found");
        }
        try {
            return new UrlResource(file.toUri());
        } catch (MalformedURLException exception) {
            throw new com.gabri.fitcoreapi.common.exception.ResourceNotFoundException("Exercise image not found");
        }
    }

    private boolean hasValidSignature(MultipartFile image, String contentType) {
        try (var input = image.getInputStream()) {
            byte[] header = input.readNBytes(12);
            if ("image/jpeg".equals(contentType)) {
                return header.length >= 3 && (header[0] & 0xff) == 0xff
                        && (header[1] & 0xff) == 0xd8 && (header[2] & 0xff) == 0xff;
            }
            if ("image/png".equals(contentType)) {
                byte[] signature = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
                return header.length >= signature.length
                        && java.util.Arrays.equals(signature, java.util.Arrays.copyOf(header, signature.length));
            }
            return header.length >= 12
                    && new String(header, 0, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("RIFF")
                    && new String(header, 8, 4, java.nio.charset.StandardCharsets.US_ASCII).equals("WEBP");
        } catch (IOException exception) {
            return false;
        }
    }
}
