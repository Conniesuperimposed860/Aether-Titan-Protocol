cmake_minimum_required(VERSION 3.10)
project(AetherTitanNative)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

add_library(aether_titan SHARED scs76_compress.cpp)

if(UNIX AND NOT APPLE)
    target_link_libraries(aether_titan PRIVATE m)
    set_target_properties(aether_titan PROPERTIES PREFIX "lib")
endif()

if(APPLE)
    set_target_properties(aether_titan PROPERTIES PREFIX "lib")
endif()

if(WIN32)
    target_compile_definitions(aether_titan PRIVATE SCS_API=__declspec(dllexport))
endif()

install(TARGETS aether_titan
    LIBRARY DESTINATION lib
    RUNTIME DESTINATION bin
    ARCHIVE DESTINATION lib
)
