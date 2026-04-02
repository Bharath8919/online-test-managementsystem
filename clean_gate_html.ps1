$path = "c:\Users\lenovo\Downloads\online-test-managementsystem\public\HTML\GATE.html"
$content = [IO.File]::ReadAllText($path)

# Remove the broken/orphaned carousel-cell blocks between sections
$content = [regex]::Replace($content, '(?s)</div>\s+</div>\s+<div class="carousel-cell">.*?Play on youtube\s+</a>\s+</div>\s+</div>\s+</div>\s+</div>\s+</div>', "</div>`n    </div>")
# This is tricky because of the nested divs. 

# Let's just do a clean rewrite of the whole body content for simplicity and correctness.
$startHeader = '<header>'
$endHeader = '</header>'
$footerScript = '<script src="flickity.pkgd.min.js"></script>'

$headerPart = $content.Substring(0, $content.IndexOf($endHeader) + $endHeader.Length)
$footerPart = $content.Substring($content.IndexOf($footerScript))

$newBody = @"

<body>
    <div class="headerlogo">
        <img src="/IMAGES/GATE_logo.png">
        <h1>Graduate Aptitude Test in Engineering</h1>
    </div>

    <div class="section1">
        <h1>Books</h1>
        <div class="carousel" data-flickity='{ "groupCells": true }'>
            <div class="carousel-cell">
                <div class="card">
                    <div class="imgBx"><img src="/IMAGES/GATEbook.jpeg"></div>
                    <div class="contentBx"><h2>Computer Science</h2><a href="#">OPEN</a></div>
                </div>
            </div>
            <div class="carousel-cell">
                <div class="card">
                    <div class="imgBx"><img src="/IMAGES/GATEbook.jpeg"></div>
                    <div class="contentBx"><h2>Mechanical</h2><a href="#">OPEN</a></div>
                </div>
            </div>
            <div class="carousel-cell">
                <div class="card">
                    <div class="imgBx"><img src="/IMAGES/GATEbook.jpeg"></div>
                    <div class="contentBx"><h2>Electronics</h2><a href="#">OPEN</a></div>
                </div>
            </div>
        </div>
    </div>

    <div class="section2">
        <h1>Videos</h1>
        <div class="carousel" data-flickity='{ "groupCells": true }'>
            <div class="carousel-cell">
                <div class="card1">
                    <img src="/IMAGES/GATE_logo.png">
                    <div class="descriptions">
                        <h2>Computer Science</h2>
                        <P>GATE CS: Essential Algorithms and Data Structures Preparation.</P>
                        <a href="https://www.youtube.com/watch?v=LAs9v9V1_0Q" target="_blank">Play on youtube</a>
                    </div>
                </div>
            </div>
            <div class="carousel-cell">
                <div class="card1">
                    <img src="/IMAGES/GATE_logo.png">
                    <div class="descriptions">
                        <h2>Mechanical</h2>
                        <P>GATE ME: Thermodynamics and Fluid Mechanics Fundamentals.</P>
                        <a href="https://www.youtube.com/watch?v=Z8nF6YmXl4s" target="_blank">Play on youtube</a>
                    </div>
                </div>
            </div>
            <div class="carousel-cell">
                <div class="card1">
                    <img src="/IMAGES/GATE_logo.png">
                    <div class="descriptions">
                        <h2>Electronics</h2>
                        <P>GATE ECE: Signal Processing and Microprocessor Architecture.</P>
                        <a href="https://www.youtube.com/watch?v=4yFvF4j_M6w" target="_blank">Play on youtube</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="section3">
        <h1>Mock Test</h1>
        <div class="carousel" data-flickity='{ "groupCells": true }'>
            <div class="carousel-cell">
                <div class="card2">
                    <div class="box">
                        <div class="content">
                            <h2>CS</h2>
                            <h3>Computer Science</h3>
                            <p>Test your knowledge in Algorithms, Data Structures, and OS.</p>
                            <a href="/mock-test/GATE_CS">TAKE TEST</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="carousel-cell">
                <div class="card2">
                    <div class="box">
                        <div class="content">
                            <h2>ME</h2>
                            <h3>Mechanical</h3>
                            <p>Exams on Thermodynamics, Fluid Mechanics, and Heat Transfer.</p>
                            <a href="/mock-test/GATE_ME">TAKE TEST</a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="carousel-cell">
                <div class="card2">
                    <div class="box">
                        <div class="content">
                            <h2>ECE</h2>
                            <h3>Electronics</h3>
                            <p>Challenge yourself with Signals, Systems, and VLSI questions.</p>
                            <a href="/mock-test/GATE_ECE">TAKE TEST</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
"@

[IO.File]::WriteAllText($path, "$headerPart`n$newBody`n$footerPart")
Write-Host "Re-written $path with clean structure"
