/**
 * Created by rechie on 14-8-19.
 */
define(function () {
    var MathUtil = {
        /**
         * 计算(x1, y1) (x2, y2)的夹角，方向不包含在内
         * @param x1
         * @param y1
         * @param x2
         * @param y2
         * @returns {number}
         */
        getAngle: function (x1, y1, x2, y2) {
            // 直角的边长
            var x = Math.abs(x1 - x2);
            var y = Math.abs(y1 - y2);
            // 斜边长
            var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            // 余弦
            var cos = x / z;
            // 弧度
            var radina = Math.acos(cos);
            // 角度
            var angle = 180 / (Math.PI / radina);
            return angle;
        },
        /**
         * 计算两个点之间的夹角
         * @param startPoint
         * @param endPoint
         */
        getAngleDirect: function (startPoint, endPoint) {
            var offsetX = endPoint.pageX - startPoint.pageX;
            var offsetY = endPoint.pageY - startPoint.pageY;
            var angle = MathUtil.getAngle(endPoint.pageX, endPoint.pageY, startPoint.pageX, startPoint.pageY);
            if (offsetY > 0) {
                if (offsetX > 0) {
                    angle = 360 - angle;
                    // 区域4
                } else {
                    // 区域3
                    angle = 180 + angle;
                }
            } else {
                if (offsetX > 0) {
                    // 区域 1
                } else {
                    // 区域2
                    angle = 180 - angle;
                }
            }
            return angle;
        },
        bezier: function (pa, pb, pc) {
            var ratio = 0;
            var dratio = 0.001;
            var pList = []
            var pab, pbc;
            for (var r = 0; r < 1000; r++) {
                pab = getPoint(pa, pb, r / 1000);
                pbc = getPoint(pb, pc, r / 1000);
                pe = getPoint(pab, pbc, r / 1000);
                pList.push(pe);
            }
            function getPoint(p0, p1, r) {
                return {
                    x: p0.x * (1 - r) + p1.x * r,
                    y: p0.y * (1 - r) + p1.y * r
                }
            }

            return pList;
        }
    };
    return MathUtil;
});