package zerooneblog.controller;

import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class MainController {

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("message", "Welcome to ZeroOne Blog!");
        return "index.html";
    }

}
