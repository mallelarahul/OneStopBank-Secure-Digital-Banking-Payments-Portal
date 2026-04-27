package com.webapp.bankingportal.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.webapp.bankingportal.dto.PinRequest;
import com.webapp.bankingportal.service.AccountService;
import com.webapp.bankingportal.util.ApiMessages;
import com.webapp.bankingportal.util.LoggedinUser;

import java.util.Map;

@RestController
@RequestMapping("/api/security")
public class SecurityController {

    @Autowired
    private AccountService accountService;

    @PostMapping("/pin/set")
    public ResponseEntity<String> setPIN(@RequestBody Map<String, String> requestBody) {
        String password = requestBody.get("password");
        String newPin = requestBody.get("newPin");
        
        // Validate required fields
        if (password == null || newPin == null) {
            return ResponseEntity.badRequest().body("Both password and newPin are required");
        }
        
        accountService.createPin(
                LoggedinUser.getAccountNumber(),
                password,
                newPin);

        return ResponseEntity.ok(ApiMessages.PIN_CREATION_SUCCESS.getMessage());
    }
}