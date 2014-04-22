(function () {

    /** @class Legend
     * @extends Plugin */
    var Jittering = {
        /**
         * @param {RenderContext} context
         * @param {ChartTools} tools
         */

        render: function (context, tools) {

            var container = tools.html
                .right
                .append('div')
                .attr('class', 'jittering')
                .append('label');

            var checkbox = container
                .insert('input', ':first-child')
                .attr('type', 'checkbox')
                .attr('id', 'applyjittering');

            var x = tools.mapper.map('x');

            var y = tools.mapper.map('y');
            var size = tools.mapper.map('size');
            var color = tools.mapper.map('color');

            var radius = 5;
            var padding = 1; /*magic parameters*/

            container
                .append('span')
                .text('Jittering');

            var data = context.data._data.map(function(d){
                return {initialX: x(d), initialY: y(d), x : x(d), y: y(d), radius: size(d)};  
            });


            var node = tools.elements(); 

            var force = d3.layout.force()
                .nodes(data)
                .size([tools.svg.layout("width"), tools.svg.layout("height")])
                .on("tick", tick)
                .charge(0)
                .gravity(0)
                .chargeDistance(500);


            d3.select("#applyjittering").on("change", function() {
                force.resume();
            });

            force.start();

            function tick(e) {
                node.each(moveTowardDataPosition(e.alpha));

                if (checkbox.node().checked) node.each(collide(e.alpha));

                node.attr("cx", function(d, i) { return data[i].x; })
                    .attr("cy", function(d, i) { return data[i].y; });

            }            
            function moveTowardDataPosition(alpha) {
                return function(d, i) {

                  data[i].x += (data[i].initialX - data[i].x) * 0.1 * alpha;
                  data[i].y += (data[i].initialY - data[i].y) * 0.1 * alpha;
                };
              } 

              // Resolve collisions between nodes.
              function collide(alpha) {
                var quadtree = d3.geom.quadtree(data);
                return function(_, i) {
                  var d = data[i];
                  var r = d.radius + radius + padding,
                      nx1 = d.x - r,
                      nx2 = d.x + r,
                      ny1 = d.y - r,
                      ny2 = d.y + r;
                  quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                      var x = d.x - quad.point.x,
                          y = d.y - quad.point.y,
                          l = Math.sqrt(x * x + y * y),
                          r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
                      if (l < r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                      }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                  });
                };
            }
        }
    };

    tau.plugins.add('jittering', Jittering);
})();