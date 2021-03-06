/*
 |--------------------------------------------------------------------------
 | Fitts' Law Experiment - Purple Team
 |--------------------------------------------------------------------------
 |
 | Here is the "guts" of our code for this project.
 | Here are some configurable variables for this project:
 */

number_of_iterations_per_trial = 5;

possible_circle_radius = [16, 32, 64];
possible_circle_distance = [128, 512];





// -------------------------------------------------------------------------
// STOP - Do not edit below this line unless you know what you are doing.
// -------------------------------------------------------------------------

$(document).ready(function() {

    $("#startUpModal").modal("show");

    $('#agreement').on('click', function() {
        if ($(this).prop("checked")) {
            $('#continueBtn').show();
        } else {
            $('#continueBtn').hide();
        }
    });

    // For consistency purposes, we will only allow Chrome and Opera users.
    var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    if (!isChrome) {
        document.write("You need to be using Google Chrome in order to take part in this experiment.");
        return;
    }
    
    fittsLaw = new FittsLaw();

    console.log("************ PROJECT INITIALIZED ************");
    console.log("*********************************************");
    console.log("");
    console.log("Window Width:  " + window.innerWidth + "px");
    console.log("Window Height: " + window.innerHeight + "px");

    window.trialLogs = [];

    fittsLaw.start();

});

/**
 * Fitts Law Starter Class
 *
 */
var FittsLaw = function() {

    this.numberOfTrials;

    this.start = function() {
        projectContainer = new ProjectContainer();
        projectContainer.draw();

        resetButton = new ResetButton(projectContainer.get());
        resetButton.draw();
    };

};

/**
 * Logger Class
 *
 */
var Logger = function() {

    var self = this;

    this.active = false;

    this.errors = [];
    this.startTime;
    this.endTime;
    this.totalTime;
    this.distanceTraveled = 0;
    this.circleRadius;
    this.circleDistance;
    this.circlePosition;
    this.points = [];

    this.calculateTotalTime = function() {
        self.totalTime = (self.endTime - self.startTime) / 1000;
    };

    /**
     * Calculate the distance traveled using the distance formula.
     * d(P1 P2) = sqrt((x1 - x2)^2 + (y1 - y2)^2)
     * 
     * @returns {void}
     */
    this.calculateTotalDistance = function() {

        var d = [];
        var D = 0;

        for (var i = 0; i < (self.points.length - 1); i++) {

            x1 = self.points[i].X;
            y1 = self.points[i].Y;

            x2 = self.points[i + 1].X;
            y2 = self.points[i + 1].Y;

            var distance = Math.sqrt((Math.pow((x1 - x2), 2)) + (Math.pow((y1 - y2), 2)));

            d.push(distance);
        }

        $.each(d, function() {
            D += this;
        });

        self.distanceTraveled = Math.ceil(D);

    };

};

/**
 * Circle Class
 *
 * This is our blueprint for creating a circle.
 */
var Circle = function(resetButton) {

    // store a pointer to 'this'
    var self = this;

    var possibleRadius = possible_circle_radius;
    var possibleDistance = possible_circle_distance;

    var actualRadius = (possibleRadius[Math.floor((Math.random() * 3))]);
    var actualDistance = (possibleDistance[Math.floor((Math.random() * 2))]);

    var possiblePosition = [((window.innerWidth / 2) + (actualDistance - actualRadius)),
        ((window.innerWidth / 2) - (actualDistance + actualRadius))];
    var actualPosition = (possiblePosition[Math.floor((Math.random() * 2))]);

    this.circle = $("<div></div>")
            .css({
                position: "absolute",
                top: "calc(50% - " + actualRadius + "px)",
                left: actualPosition + "px",
                backgroundColor: "#337AB7",
                border: "2px solid #2E6DA4",
                width: (actualRadius * 2) + "px",
                height: (actualRadius * 2) + "px"
            })
            .addClass("circle")
            .on("click", function(event) {

                resetButton.prop("disabled", false);
                self.circle.remove();

                window.logger.endTime = Date.now();
                window.logger.calculateTotalTime();
                window.logger.calculateTotalDistance();
                window.logger.active = false;

                window.trialLogs.push(window.logger);

                if (number_of_iterations_per_trial === window.trialLogs.length) {
                    displayResults(resetButton);
                }

                console.clear();
                console.log("Current Logs:")
                console.log(window.trialLogs);

            });

    this.get = function() {
        return this.circle;
    };

    console.clear();
    console.log("************** CIRCLE CREATED **************");
    console.log("********************************************");
    console.log("");
    console.log("Radius:   " + actualRadius + "px");
    console.log("Distance: " + actualDistance + "px");
    console.log("Position: " + (actualPosition > 550 ? "Right" : "Left"));

    window.logger.circleRadius = actualRadius;
    window.logger.circleDistance = actualDistance;
    window.logger.circlePosition = (actualPosition > 550 ? "Right" : "Left");

};

/**
 * Project Container Class
 *
 *
 */
var ProjectContainer = function() {

    // store a pointer to 'this'
    var self = this;

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.projectContainer = $("<div></div>")
            .css({
                height: self.height + "px",
                width: self.width + "px"
            })
            .addClass("project-container")
            .on("mousemove", function(event) {
                try {
                    if (window.logger.active) {

                        var point = {X: event.clientX, Y: event.clientY};
                        window.logger.points.push(point);

                        window.logger.distanceTraveled++;





                    }
                } catch (error) {

                }
            })
            .on("click", function(event) {
                try {
                    if (window.logger.active) {
                        var error = {
                            MouseX: event.clientX,
                            MouseY: event.clientY
                        };
                        window.logger.errors.push(error);
                    }
                } catch (error) {

                }

            });

    this.draw = function() {
        $(document.body).append(this.projectContainer);
    };

    this.add = function(circle) {
        this.projectContainer.append(circle);
    };

    this.get = function() {
        return this.projectContainer;
    };

};

/**
 * Reset Button Class
 * 
 * @param {type} projectContainer
 */
var ResetButton = function(projectContainer) {

    // store a pointer to 'this'
    var self = this;

    this.resetButton = $("<button type='button'>Go</button>")
            .addClass("reset-button btn btn-success")
            .on("click", function() {

                window.logger = new Logger();
                window.logger.active = true;
                window.logger.startTime = Date.now();

                var circle = new Circle(self.resetButton);
                $(projectContainer).append(circle.get());
                self.resetButton.prop("disabled", true);

            });

    this.draw = function() {
        $(document.body).append(this.resetButton);
    };

};

function displayResults(resetButton) {

    resetButton.prop("disabled", true);
    $("#alertMessage").show();

    $("#participantName").html($("#name").val());

    $("#resultsModal").modal("show");

    $("#results").append('<thead><th>Trial Number</th><th>Total Time</th><th>Distance Traveled (Approx)</th><th>Number of Errors</th><th>Circle Radius</th><th>Circle Distance</th><th>Circle Position</th></thead>');

    for (i = 0; i < window.trialLogs.length; i++) {
        $("#results").append('<tbody>'
                + '<td>' + (i + 1) + '</td>'
                + '<td>' + window.trialLogs[i].totalTime + ' sec</td>'
                + '<td>' + window.trialLogs[i].distanceTraveled + 'px</td>'
                + '<td>' + window.trialLogs[i].errors.length + '</td>'
                + '<td>' + window.trialLogs[i].circleRadius + 'px</td>'
                + '<td>' + window.trialLogs[i].circleDistance + 'px</td>'
                + '<td>' + window.trialLogs[i].circlePosition + '</td>'
                + '</tbody>');
    }

    console.log(window.trialLogs);
}
