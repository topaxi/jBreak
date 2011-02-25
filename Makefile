SRC_DIR = src
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

BASE_FILES = ${SRC_DIR}/core.js\
	${SRC_DIR}/array.js\
	${SRC_DIR}/animate.js\
	${SRC_DIR}/ball.js\
	${SRC_DIR}/bonus.js\
	${SRC_DIR}/paddle.js\
	${SRC_DIR}/ui.js\
	${SRC_DIR}/cookie.js\
	${SRC_DIR}/options.js\
	${SRC_DIR}/editor.js

MODULES = ${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/outro.js

JB = ${DIST_DIR}/jBreak.js
JB_MIN = ${DIST_DIR}/jBreak.min.js

JB_VER = `cat version.txt`
VER = sed s/@VERSION/${JB_VER}/

MINJAR = java -jar ${BUILD_DIR}/google-compiler-20110225.jar

DATE=`git log -1 | grep Date: | sed 's/[^:]*: *//'`

all: jBreak min
	@@echo "jBreak build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

jBreak: ${DIST_DIR} ${JB}

${JB}: ${MODULES}
	@@echo "Building" ${JB}

	@@mkdir -p ${DIST_DIR}

	@@cat ${MODULES} | \
		sed 's/Date:.*/&'"${DATE}"'/' | \
		${VER} > ${JB};

min: ${JB_MIN}

${JB_MIN}: ${JB}
	@@echo "Building" ${JB_MIN}

	@@head -n 19 ${JB} > ${JB_MIN}
	@@${MINJAR} --js ${JB} --warning_level QUIET >> ${JB_MIN}

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
