cmake_minimum_required(VERSION 3.15)
project(scs76_sdk LANGUAGES CXX)

add_library(scs76_sdk SHARED scs76_sdk.cpp scs76_compress.cpp)
target_compile_features(scs76_sdk PUBLIC cxx_std_17)
target_include_directories(scs76_sdk PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})
target_compile_definitions(scs76_sdk PRIVATE SCS76_SDK_EXPORT)

add_library(scs76_sdk_static STATIC scs76_sdk.cpp scs76_compress.cpp)
target_compile_features(scs76_sdk_static PUBLIC cxx_std_17)
target_include_directories(scs76_sdk_static PUBLIC ${CMAKE_CURRENT_SOURCE_DIR})

install(TARGETS scs76_sdk scs76_sdk_static
        ARCHIVE DESTINATION lib
        LIBRARY DESTINATION lib
        RUNTIME DESTINATION bin)
install(FILES scs76_sdk.h DESTINATION include)
