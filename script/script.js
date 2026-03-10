const $ = (e) => document.querySelector(e)
const $$ = (e) => [...document.querySelectorAll(e)]
const input = $(".commandInput")
const output = $(".output")

function print(text) {
    output.innerHTML += `<p>${text}</p>`
    output.scrollTop = output.scrollHeight;
}

function printLine(line) {
    let i = 0
    function next() {
        if(i < line.length) {
            print(line[i])
            i++
            setTimeout(next, 200)
        }
    }
    next()
}

const bootText = [
    "> portolio Loading...",
    ">",
    "> Type `help` to see commands."
]

let i = 0

function boot() {
    if(i < bootText.length) {
        print(bootText[i])
        i++
        setTimeout(boot, 500)
    }
}
boot()

input.addEventListener("keydown",(e) => {
    if(e.key === "Enter") {
        const cmd = input.value.trim()
        print("> " + cmd)
        runCommand(cmd)
        input.value = ""
    }
})

function runCommand(cmd) {
    switch(cmd) {
        case "help": 
            printLine(
            ["> whoami - about me",
            "> skills - my skills",
            "> project - my project and awards",
            "> contact - contact info",
            "> clear - clear teminal  ",
            ])
            break

        case "whoami":
            printLine([
            "> 안녕하세요 서울디지텍고 2학년 3반 박시후입니다.",
            "> 전 2009년 7월 14일에 태어났으며,",
            "> 현재 기능반 활동을 통해 꾸준히 역량을 키우고 있습니다.",
            "> 프론트엔드 개발자, 혹은 풀스택 개발자를 목표로 두고 있으며",
            "> 꿈은 세상의 모든 애니메이션 시청입니다.",
            "> 감사합니다.",
        ])
            break

        case "skills":
            printLine([
            "> - HTML",
            "> - CSS",
            "> - Javascript",
            "> - PHP",
            "> - MYSQL",
            "> - React",
            ])
            break
        
        case "project": 
        printLine([
            "> - 웹디자인기능사",
            "> - ITQ 엑셀",
            "> - ITQ 한글",
            "> - 현대 제로원 참여",
            "> - 2025 해커톤 동상",
            "> - 2025 웹&앱 경진대회 장려상",
            "> - 2025 포트폴리오 경진대회 장려상",
            ])
            break
        case "contact": 
            printLine([
                "> - github: @sihuxx",
                "> - instargram: @si_ihhu",
                "> - gmail: sihu714@gmail.com",
            ])
            break
        default: 
            printLine([`${cmd}: command not found`])
            break
        case "clear":
           output.innerHTML = ""
           i = 0
           boot()
           break
    }
}

window.addEventListener("DOMContentLoaded", () => {
    input.focus()
})